import { Injectable, OnModuleInit } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private kcAdminClient: KcAdminClient;

  constructor(private configService: ConfigService) {
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

      console.log('✅ User created:', user);
      await this.assignRoleToUser(user.id, 'Acheteur');
      return user;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
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
        console.warn(`⚠️ Role "${roleName}" not found in Keycloak`);
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

      console.log(`✅ Role "${roleName}" assigned to user ${userId}`);

    } catch (error) {
      console.error(`❌ Failed to assign role "${roleName}":`, error);
      throw error;
    }
  }
}
