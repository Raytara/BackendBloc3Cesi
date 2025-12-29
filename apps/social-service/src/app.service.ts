import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma/prismaService';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateConversationDto, SendMessageDto } from './dto/conversation.dto';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createReview(createReviewDto: CreateReviewDto) {
    // prevent duplicate reviews by the same author for the same target
    const existing = await this.prisma.client.review.findFirst({
      where: {
        authorId: createReviewDto.authorId,
        targetId: createReviewDto.targetId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Review already exists for this author and target',
      );
    }

    try {
      return await this.prisma.client.review.create({
        data: createReviewDto,
      });
    } catch (err: any) {
      // Prisma unique constraint error code
      if (err.code === 'P2002') {
        throw new ConflictException(
          'Review already exists for this author and target',
        );
      }
      throw err;
    }
  }

  async getReviews(targetId: string) {
    // fetch all and filter deleted client-side to avoid prisma client types mismatch
    const all = await this.prisma.client.review.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
    });

    const reviews = all.filter((r) => !(r as any).deletedAt);

    // compute aggregates from filtered reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? reviews.reduce((s, r) => s + (r.rating as number), 0) / totalReviews
      : 0;

    return {
      reviews,
      averageRating,
      totalReviews,
    };
  }

  async findOrCreateConversation(data: CreateConversationDto) {
    const existing = await this.prisma.client.conversation.findUnique({
      where: { orderId: data.orderId },
      include: { messages: true },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.client.conversation.create({
      data: {
        orderId: data.orderId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
    });
  }

  async sendMessage(data: SendMessageDto) {
    // 1. Vérifier que la conversation existe et que l'utilisateur en fait partie
    const conversation = await this.prisma.client.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      throw new ConflictException('Conversation not found');
    }

    if (
      conversation.buyerId !== data.senderId &&
      conversation.sellerId !== data.senderId
    ) {
      throw new ConflictException('User is not part of this conversation');
    }

    return this.prisma.client.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
    });
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }, // Souvent on veut les plus récents d'abord pour la pagination
      take: limit,
      skip: skip,
    });
  }

  async getUserConversations(userId: string) {
    return this.prisma.client.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.client.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      return { success: false, message: 'Review not found' };
    }

    if (review.authorId !== userId) {
      return { success: false, message: 'Forbidden' };
    }

    await this.prisma.client.review.update({
      where: { id: reviewId },
      data: { deletedAt: new Date() } as any,
    });

    return { success: true };
  }
}
