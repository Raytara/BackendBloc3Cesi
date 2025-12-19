import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('hello_article_service')
  getHello(): string {
    console.log("[ArticleService] Message hello reçu");
    return "Hello world from Article Microservice";
  }
}
