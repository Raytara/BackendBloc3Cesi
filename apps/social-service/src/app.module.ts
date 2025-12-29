import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prismaModule';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
