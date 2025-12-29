import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Req,
  Param,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Public, Roles } from 'nest-keycloak-connect';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(
    @Inject('ARTICLE_SERVICE') private readonly articlesClient: ClientProxy,
  ) {}

  @Get('hello')
  @Public()
  @ApiOperation({ summary: 'Test de connexion au service articles' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue du service articles',
  })
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_article_service';
    const payload = {};

    return this.articlesClient.send<string>(pattern, payload);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Récupérer tous les articles' })
  @ApiResponse({ status: 200, description: 'Liste de tous les articles' })
  getAllArticles(): Observable<any[]> {
    const pattern = 'get_all_articles';
    const payload = {};
    return this.articlesClient.send<any[]>(pattern, payload);
  }

  @Get('category/:categoryId')
  @Public()
  @ApiOperation({ summary: 'Récupérer les articles par catégorie' })
  @ApiParam({
    name: 'categoryId',
    description: 'ID de la catégorie',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des articles de la catégorie',
  })
  getArticlesByCategory(
    @Param('categoryId') categoryId: string,
  ): Observable<any[]> {
    const pattern = 'get_articles_by_category';
    return this.articlesClient.send<any[]>(pattern, categoryId);
  }

  @Post('createMagasin')
  @Roles('Vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau magasin (vendeurs uniquement)' })
  @ApiResponse({ status: 201, description: 'Magasin créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle vendeur requis',
  })
  createMagasin(@Body() createMagasinDto: CreateMagasinDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.articlesClient.send('post_magasin', {
      ...createMagasinDto,
      sellerId: userId,
    });
  }

  @Post('create')
  @Roles('Vendeur')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel article (vendeurs uniquement)' })
  @ApiResponse({ status: 201, description: 'Article créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle vendeur requis',
  })
  createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.articlesClient.send('post_article', {
      ...createArticleDto,
      authorId: userId,
    });
  }
}
