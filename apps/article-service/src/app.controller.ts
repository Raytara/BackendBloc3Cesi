import { Controller, Body,  Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('hello_article_service')
  getHello(): string {
    console.log("[ArticleService] Message hello reçu");
    return "Hello world from Article Microservice";
  }

  @MessagePattern('get_all_articles')
  getAllArticles() {
    return this.appService.getAllArticles();
  }

  @MessagePattern('post_article')
  postArticle(@Body() createArticleDto: CreateArticleDto) {
    return this.appService.createArticle(createArticleDto);
  }
}
