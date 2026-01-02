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

  async getAllUsers(data: { adminId: string }) {
    try {
      // Appeler authentication-service pour récupérer tous les utilisateurs
      const result = await lastValueFrom(
        this.userService.send('get_all_users', {}),
      );

      // Pas de log pour une simple lecture
      return result;
    } catch (error) {
      console.error('Failed to get all users:', error);
      return {
        success: false,
        error: error.message || 'Failed to get all users',
      };
    }
  }

  async banUser(data: { userId: string; reason?: string; adminId: string }) {
    try {
      // Protection auto-ban : vérifier si l'admin essaie de se bannir lui-même
      if (data.userId === data.adminId) {
        return {
          success: false,
          error: 'Vous ne pouvez pas vous bannir vous-même',
        };
      }

      // 1. Appeler authentication-service pour bannir l'utilisateur
      const result = await lastValueFrom(
        this.userService.send('ban_user', {
          userId: data.userId,
          reason: data.reason,
        }),
      );

      // 2. Si erreur, retourner l'erreur
      if (!result.success) {
        return result;
      }

      // 3. Logger l'action dans la base admin
      const log = await this.prisma.client.adminLog.create({
        data: {
          adminId: data.adminId,
          action: AdminAction.BAN,
          targetType: TargetType.USER,
          targetId: data.userId,
          reason: data.reason,
          changes: {
            isBanned: { from: false, to: true },
          },
        },
      });

      // 4. Retourner le succès avec l'utilisateur et le log
      return {
        success: true,
        user: result.user,
        log: log,
      };
    } catch (error) {
      console.error('Failed to ban user:', error);
      return {
        success: false,
        error: error.message || 'Failed to ban user',
      };
    }
  }

  async unbanUser(data: { userId: string; reason?: string; adminId: string }) {
    try {
      // 1. Appeler authentication-service pour débannir l'utilisateur
      const result = await lastValueFrom(
        this.userService.send('unban_user', {
          userId: data.userId,
          reason: data.reason,
        }),
      );

      // 2. Si erreur, retourner l'erreur
      if (!result.success) {
        return result;
      }

      // 3. Logger l'action dans la base admin
      const log = await this.prisma.client.adminLog.create({
        data: {
          adminId: data.adminId,
          action: AdminAction.UNBAN,
          targetType: TargetType.USER,
          targetId: data.userId,
          reason: data.reason,
          changes: {
            isBanned: { from: true, to: false },
          },
        },
      });

      // 4. Retourner le succès avec l'utilisateur et le log
      return {
        success: true,
        user: result.user,
        log: log,
      };
    } catch (error) {
      console.error('Failed to unban user:', error);
      return {
        success: false,
        error: error.message || 'Failed to unban user',
      };
    }
  }
}
