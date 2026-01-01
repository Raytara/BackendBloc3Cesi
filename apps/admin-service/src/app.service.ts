import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prismaService';
import { AdminAction, TargetType } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('ARTICLE_SERVICE') private readonly articleService: ClientProxy,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
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

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      // 1. Appeler authentication-service pour créer l'admin
      const result = await lastValueFrom(
        this.userService.send('create_admin_user', {
          username: createAdminDto.username,
          email: createAdminDto.email,
          password: createAdminDto.password,
          firstName: createAdminDto.firstName,
          lastName: createAdminDto.lastName,
        }),
      );

      // 2. Si erreur, retourner l'erreur
      if (!result.success) {
        return result;
      }

      // 3. Logger l'action dans la base admin
      const log = await this.prisma.client.adminLog.create({
        data: {
          adminId: createAdminDto.adminId,
          action: AdminAction.CREATE,
          targetType: TargetType.USER,
          targetId: result.user.id,
          changes: {
            username: result.user.username,
            email: result.user.email,
            role: 'ADMIN',
          },
        },
      });

      // 4. Retourner le succès avec l'admin créé et le log
      return {
        success: true,
        user: result.user,
        log: log,
      };
    } catch (error) {
      console.error('Failed to create admin:', error);
      return {
        success: false,
        error: error.message || 'Failed to create admin',
      };
    }
  }
}
