import {
  Body,
  Post,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Res,
  Req,
  Headers,
} from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Response } from 'express';
import { map } from 'rxjs/operators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get('hello')
  @Public()
  @ApiOperation({ summary: 'Test de connexion au service utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue du service utilisateur',
  })
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_users_service';
    const payload = {};

    return this.usersClient.send<string>(pattern, payload);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersClient.send('create_user', createUserDto);
  }

  @Post('become-seller')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Passer en mode vendeur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur passé en mode vendeur avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  becomeSeller(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const jwt = authorization.substring(7); // Remove "Bearer " prefix
    return this.usersClient.send('become_seller', { jwt });
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie, tokens retournés',
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersClient
      .send<{
        access_token: string;
        refresh_token: string;
      }>('login_user', loginUserDto)
      .pipe(
        map((tokens) => {
          res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000, // 1 heure
          });

          res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 3600 * 1000, // 7 jours
          });

          return tokens;
        }),
      );
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  logoutUser(
    @Body('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ): Observable<{ message: string }> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.usersClient.send<{ message: string }>('logout_user', {
      refresh_token,
    });
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: "Rafraîchir le token d'accès" })
  @ApiResponse({
    status: 200,
    description: 'Nouveaux tokens générés avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de rafraîchissement invalide',
  })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.usersClient
      .send<{
        access_token: string;
        refresh_token: string;
      }>('refresh_token', refreshTokenDto)
      .pipe(
        map((tokens) => {
          res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600 * 1000, // 1 heure
          });

          res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 3600 * 1000, // 7 jours
          });

          return tokens;
        }),
      );
  }
}
