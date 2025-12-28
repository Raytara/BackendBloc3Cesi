import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prismaService';
import { CreateReviewDto } from './dto/create-review.dto';

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
}
