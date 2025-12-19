import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Public } from 'nest-keycloak-connect';


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
}
