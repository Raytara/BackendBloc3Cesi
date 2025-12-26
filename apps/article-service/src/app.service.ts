import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateMagasinDto } from './dto/create-magasin.dto';
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

  async getArticleByCategorie(categoryId: string) {
    const filtered = await prisma.article.findMany({
      where: { 
        categoryId: categoryId.trim(),
        status: Status.APPROUVE 
      },
    });
    return filtered;  
  }

  async createMagasin(createMagasinDto: CreateMagasinDto) {
    const magasin = await prisma.boutique.create({
      data: {
        sellerId: createMagasinDto.sellerId,
        name: createMagasinDto.name,
        description: createMagasinDto.description,
      },
    });
    return { message: 'Magasin created successfully', magasin };
  }

  async updateStock(productId: string, quantity: number) {
    try {
      const article = await prisma.article.findUnique({ where: { id: productId } });
      if (article && article.stock !== null) {
        const newStock = article.stock - quantity;
        const finalStock = newStock >= 0 ? newStock : 0;

        const updateData: { stock: number; status?: Status } = { stock: finalStock };
        if (finalStock === 0) {
          updateData.status = Status.VENDU;
        }

        await prisma.article.update({
          where: { id: productId },
          data: updateData,
        });
        console.log(`Stock updated for article ${productId}. New stock: ${finalStock}`);
      } else {
        console.warn(`Article ${productId} not found or stock is null.`);
      }
    } catch (error) {
      console.error(`Error updating stock for article ${productId}:`, error);
    }
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

    const article = await prisma.article.create({
      data: {
        boutiqueId: createArticleDto.boutiqueId || null,
        sellerId: createArticleDto.authorId,
        title: createArticleDto.title,
        description: createArticleDto.description,
        price: createArticleDto.price,
        stock: createArticleDto.stock || 0,
        categoryId: createArticleDto.categoryId || null,
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
