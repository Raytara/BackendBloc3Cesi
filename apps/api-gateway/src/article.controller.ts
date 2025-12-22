import { Controller, Get, Post, Body, Inject, Req, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Public, Roles } from 'nest-keycloak-connect';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateMagasinDto } from './dto/create-magasin.dto';

@Controller('articles')
export class ArticleController {
  constructor(@Inject('ARTICLE_SERVICE') private readonly articlesClient: ClientProxy) { }

    @Get('hello')
    @Public()
    getHelloFromMicroservice(): Observable<string> {
      const pattern = 'hello_article_service'; 
      const payload = {};

      return this.articlesClient.send<string>(pattern, payload);
    }

    @Get('all')
    @Public()
    getAllArticles(): Observable<any[]> {
      const pattern = 'get_all_articles'; 
      const payload = {};
      return this.articlesClient.send<any[]>(pattern, payload);
    }

    @Get('category/:categoryId')
    @Public()
    getArticlesByCategory(@Param('categoryId') categoryId: string): Observable<any[]> {
      const pattern = 'get_articles_by_category'; 
      return this.articlesClient.send<any[]>(pattern, categoryId);
    }

    @Post('createMagasin')
    @Roles('Vendeur')
    createMagasin(@Body() createMagasinDto: CreateMagasinDto, @Req() req: any) {
        const userId = req.user.sub;
        return this.articlesClient.send('post_magasin',  { ...createMagasinDto, sellerId: userId });
    }

    @Post('create')
    @Roles('Vendeur')
    createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req: any) {
        const userId = req.user.sub;         
      return this.articlesClient.send('post_article',  { ...createArticleDto, authorId: userId });
    }
}
