import { Controller, Get, Post, Body, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Public, Roles } from 'nest-keycloak-connect';
import { CreateArticleDto } from './dto/create-article.dto';


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

    @Post('create')
    @Public()
    createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req: any) {
        const userId = req.user.sub;

        // console.log('Creating article for user ID:', userId);
        // console.log('User roles:', req.user.realm_access?.roles);
            

      return this.articlesClient.send('post_article',  { ...createArticleDto, authorId: userId });
    }
}
