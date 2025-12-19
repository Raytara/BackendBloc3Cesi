import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { KeycloakConnectModule, ResourceGuard, RoleGuard, AuthGuard } from 'nest-keycloak-connect';
import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.join(process.cwd(), '.env') }),
    KeycloakConnectModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.getOrThrow<string>('KEYCLOAK_AUTH_SERVER_URL'),
        realm: configService.getOrThrow<string>('KEYCLOAK_REALM'),
        clientId: configService.getOrThrow<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.getOrThrow<string>('KEYCLOAK_SECRET'),
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
    ]),
  ],
  controllers: [AppController],
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
      useClass: RoleGuard,
    },
  ],
})
export class AppModule { }
