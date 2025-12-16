import { Injectable, OnModuleInit } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from './prisma/prismaService'; 
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private kcAdminClient: KcAdminClient;

  constructor(private configService: ConfigService, private prismaService: PrismaService) {
    
    this.kcAdminClient = new KcAdminClient({
      baseUrl: this.configService.get<string>('KEYCLOAK_BASE_URL')!,
      realmName: this.configService.get<string>('KEYCLOAK_REALM')!,
    });
  }

  async onModuleInit() {
    try {
      await this.kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
        clientSecret: this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!,
      });
      setInterval(async () => {
        try {
          await this.kcAdminClient.auth({
            grantType: 'client_credentials',
            clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
            clientSecret: this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!,
          });
        } catch (error) {
          console.error('❌ Token refresh failed', error.message);
        }
      }, 58 * 1000);

    } catch (error) {
      console.error('❌ Failed to authenticate Keycloak Admin Client');
      console.error('Error:', error.responseData || error.message);
      throw error;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const user = await this.kcAdminClient.users.create({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        username: createUserDto.username,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        enabled: true,
        emailVerified: true,
        credentials: [{
          type: 'password',
          value: createUserDto.password,
          temporary: false,
        }],
      });

      await this.assignRoleToUser(user.id, 'Acheteur'); 

      await this.prismaService.client.user.create({
        data: {
          keycloakId: user.id!,
          username: createUserDto.username,
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          password: '',
        },
      });

      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  private async assignRoleToUser(userId: string, roleName: string) {
    try {
      const role = await this.kcAdminClient.roles.findOneByName({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        name: roleName,
      });

      if (!role) {
        console.warn(`Role "${roleName}" not found in Keycloak`);
        return;
      }

      await this.kcAdminClient.users.addRealmRoleMappings({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        id: userId,
        roles: [{
          id: role.id!,
          name: role.name!,
        }],
      });

    } catch (error) {
      console.error(`Failed to assign role "${roleName}":`, error);
      throw error;
    }
  }

  async login (loginUserDto: LoginUserDto) {
    try {
      // Utiliser fetch pour obtenir les tokens
      const tokenUrl = `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/realms/${this.configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
        client_secret: this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!,
        username: loginUserDto.email,
        password: loginUserDto.password,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const tokenResponse = await response.json();

      const userInfo = await this.kcAdminClient.users.find({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        email: loginUserDto.email,
        exact: true,
      });

      if (!userInfo || userInfo.length === 0) {
        throw new Error('User not found');
      }

      const user = userInfo[0];

      return {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      console.error('Failed to login:', error);
      throw new Error('Invalid credentials');
    }
  }
}
