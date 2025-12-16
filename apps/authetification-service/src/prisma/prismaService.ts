import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import prisma from '../../lib/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  get client() {
    return prisma;
  }

  async onModuleInit() {
    try {
      await prisma.$connect();
      this.logger.log('Prisma connecté avec succès !');
    } catch (error) {
      this.logger.error('Erreur de connexion Prisma', error);
    }
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
    this.logger.log('Prisma déconnecté');
  }
}