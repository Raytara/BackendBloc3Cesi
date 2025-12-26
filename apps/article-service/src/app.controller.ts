import { Controller, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateMagasinDto } from './dto/create-magasin.dto';

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

  @MessagePattern('get_articles_by_category')
  getArticleByCategorie(@Payload() categoryId: string) {
    return this.appService.getArticleByCategorie(categoryId);
  }

  @MessagePattern('post_magasin')
  postMagasin(@Payload() createMagasinDto: CreateMagasinDto) {
    return this.appService.createMagasin(createMagasinDto);
  }

  @MessagePattern('post_article')
  postArticle(@Payload() createArticleDto: CreateArticleDto) {
    return this.appService.createArticle(createArticleDto);
  }

  @EventPattern('order_confirmed')
  async handleOrderConfirmed(@Payload() order: any) {   
    if (order.productId && order.quantity) {
      await this.appService.updateStock(order.productId, order.quantity);
    }
  }
}
