import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prismaService';
import { AdminAction, TargetType } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('ARTICLE_SERVICE') private readonly articleService: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    // 1. Appeler article-service pour créer la catégorie
    const result = await lastValueFrom(
      this.articleService.send('create_category', {
        name: createCategoryDto.name,
      }),
    );

    // 2. Si erreur (doublon), retourner l'erreur
    if (!result.success) {
      return result;
    }

    // 3. Logger l'action dans la base admin
    const log = await this.prisma.client.adminLog.create({
      data: {
        adminId: createCategoryDto.adminId,
        action: AdminAction.CREATE,
        targetType: TargetType.CATEGORY,
        targetId: result.category.id,
        changes: {
          name: result.category.name,
        },
      },
    });

    // 4. Retourner le succès avec la catégorie et le log
    return {
      success: true,
      category: result.category,
      log: log,
    };
  }
}
