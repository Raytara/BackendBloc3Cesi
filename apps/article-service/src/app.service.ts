import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { CreateArticleDto } from './dto/create-article.dto';
import { Status } from '@prisma/client';

@Injectable()
export class AppService {
  private readonly bannedWords = [
    'arnaque',
    'scam',
    'fake',
    'contrefaçon',
    'volé',
    'drogue',
    'arme',
    'illégal',
    'terrorisme',
    'spam',
  ];

  getHello(): string {
    return 'Hello World!';
  }

  async getAllArticles() {
    return prisma.article.findMany({
      where: { status: Status.APPROUVE },
    });
  }

  private containsBannedWords(text: string): boolean {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    return this.bannedWords.some(word => lowerText.includes(word.toLowerCase()));
  }

  async createArticle(createArticleDto: CreateArticleDto) {
    const hasBannedWords = 
      this.containsBannedWords(createArticleDto.title) || 
      this.containsBannedWords(createArticleDto.description || '');
    
    const status = hasBannedWords ? Status.EN_ATTENTE : Status.APPROUVE;
    
    console.log('Banned words detected:', hasBannedWords);
    console.log('Status will be:', status);
    
    const article = await prisma.article.create({
      data: {
        boutiqueId: createArticleDto.boutiqueId || null,
        sellerId: createArticleDto.authorId,
        title: createArticleDto.title,
        description: createArticleDto.description,
        price: createArticleDto.price,
        stock: createArticleDto.stock || 0,
        status: status,
      },
    });

    const message = hasBannedWords 
      ? 'Article created successfully - En attente de modération (mots suspects détectés)'
      : 'Article created successfully - Approuvé automatiquement';

    return { 
      message, 
      article,
      autoApproved: !hasBannedWords 
    };
  }
}
