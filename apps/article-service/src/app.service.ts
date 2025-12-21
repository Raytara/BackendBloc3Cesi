import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async createArticle(createArticleDto: CreateArticleDto) {
    console.log('Article data received in Article Service:', createArticleDto);
    
    const article = await prisma.article.create({
      data: {
        boutiqueId: createArticleDto.boutiqueId || null,
        sellerId: createArticleDto.authorId,
        title: createArticleDto.title,
        description: createArticleDto.description,
        price: createArticleDto.price,
        stock: createArticleDto.stock || 0,
      },
    });

    return { message: 'Article created successfully', article };
  }
}
