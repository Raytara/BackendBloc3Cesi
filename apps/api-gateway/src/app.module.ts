import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard, TokenValidation } from 'nest-keycloak-connect';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ArticleController } from './article.controller';
import { CustomRoleGuard } from './roles.guard';
import { CommandeController } from './commande.controller';
import { WebhookController } from './webhook.controller';
import { PaymentCallbackController } from './payment-callback.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.join(process.cwd(), '.env') }),
    KeycloakConnectModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.getOrThrow<string>('KEYCLOAK_AUTH_SERVER_URL'),
        realm: configService.getOrThrow<string>('KEYCLOAK_REALM'),
        clientId: configService.getOrThrow<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.getOrThrow<string>('KEYCLOAK_SECRET'),
        tokenValidation: TokenValidation.ONLINE,
        roleSource: 'ressource',
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'ARTICLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      }, 
      {
        name: 'COMMANDE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3003,
        },
      },
    ]),
  ],
  controllers: [AppController, ArticleController, CommandeController, WebhookController, PaymentCallbackController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomRoleGuard,
    },
  ],
})
export class AppModule { }
