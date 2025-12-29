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
import { SocialController } from './social.controller';

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
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: false
          },
        },
      },
      {
        name: 'ARTICLE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'article_queue',
          queueOptions: {
            durable: false
          },
        },
      }, 
      {
        name: 'COMMANDE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'commande_queue',
          queueOptions: {
            durable: false
          },
        },
      },
      {
        name: 'SOCIAL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'social_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [AppController, ArticleController, CommandeController, WebhookController, PaymentCallbackController, SocialController],
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
