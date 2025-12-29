import { Injectable } from '@nestjs/common';
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
    return this.prisma.client.review.create({
      data: createReviewDto,
    });
  }

  async getReviews(targetId: string) {
    const reviews = await this.prisma.client.review.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
    });

    const aggregations = await this.prisma.client.review.aggregate({
      where: { targetId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      reviews,
      averageRating: aggregations._avg.rating || 0,
      totalReviews: aggregations._count.rating || 0,
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
    return this.prisma.client.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.client.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
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
}
