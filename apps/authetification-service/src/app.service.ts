import { Injectable, OnModuleInit } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from './prisma/prismaService';
import { LoginUserDto } from './dto/login-user.dto';
import { LogoutUserDto } from './dto/logout-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BecomeSellerDto } from './dto/become-seller.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private kcAdminClient: KcAdminClient;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
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
            clientId: this.configService.get<string>(
              'KEYCLOAK_CLIENT_ID_NAME',
            )!,
            clientSecret: this.configService.get<string>(
              'KEYCLOAK_CLIENT_SECRET',
            )!,
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
        credentials: [
          {
            type: 'password',
            value: createUserDto.password,
            temporary: false,
          },
        ],
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
        roles: [
          {
            id: role.id!,
            name: role.name!,
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to assign role "${roleName}":`, error);
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.prismaService.client.user.findUnique({
        where: { email: loginUserDto.email },
      });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.isBanned) {
        throw new Error('User is banned');
      }

      // Utiliser fetch pour obtenir les tokens
      const tokenUrl = `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/realms/${this.configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/token`;

      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
        client_secret: this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
        )!,
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

      return {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
      };
    } catch (error) {
      console.error('Failed to login:', error);
      throw new Error('Invalid credentials');
    }
  }

  async becomeSeller(becomeSellerDto: BecomeSellerDto) {
    try {
      // Decode JWT to extract user ID (sub claim)
      const payload = JSON.parse(
        Buffer.from(becomeSellerDto.jwt.split('.')[1], 'base64').toString(),
      );

      if (!payload || !payload.sub) {
        throw new Error('Invalid JWT token');
      }

      // Remove Acheteur role from Keycloak
      const acheteurRole = await this.kcAdminClient.roles.findOneByName({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        name: 'Acheteur',
      });

      if (acheteurRole) {
        await this.kcAdminClient.users.delRealmRoleMappings({
          realm: this.configService.get<string>('KEYCLOAK_REALM')!,
          id: payload.sub,
          roles: [{ id: acheteurRole.id!, name: acheteurRole.name! }],
        });
      }

      // Add Vendeur role to Keycloak
      await this.assignRoleToUser(payload.sub, 'Vendeur');

      // Update role in Prisma database
      await this.prismaService.client.user.update({
        where: { keycloakId: payload.sub },
        data: { role: 'VENDEUR' },
      });

      return { message: 'User promoted to seller successfully' };
    } catch (error) {
      console.error('Failed to promote user to seller:', error);
      throw new Error('Failed to promote user to seller');
    }
  }

  async logout(logoutUserDto: LogoutUserDto) {
    try {
      const logoutUrl = `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/realms/${this.configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/logout`;

      const params = new URLSearchParams({
        client_id: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
        client_secret: this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
        )!,
        refresh_token: logoutUserDto.refresh_token,
      });

      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      return { message: 'Logout successful' };
    } catch (error) {
      console.error('Failed to logout:', error);
      throw new Error('Failed to logout');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const tokenUrl = `${this.configService.get<string>('KEYCLOAK_BASE_URL')}/realms/${this.configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/token`;

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.configService.get<string>('KEYCLOAK_CLIENT_ID_NAME')!,
        client_secret: this.configService.get<string>(
          'KEYCLOAK_CLIENT_SECRET',
        )!,
        refresh_token: refreshTokenDto.refresh_token,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Invalid refresh token');
      }

      const tokenResponse = await response.json();

      return {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
      };
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Invalid refresh token');
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      // 1. Créer l'utilisateur dans Keycloak
      const user = await this.kcAdminClient.users.create({
        realm: this.configService.get<string>('KEYCLOAK_REALM')!,
        username: createAdminDto.username,
        email: createAdminDto.email,
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: 'password',
            value: createAdminDto.password,
            temporary: false,
          },
        ],
      });

      // 2. Assigner le rôle Admin
      await this.assignRoleToUser(user.id, 'Admin');

      // 3. Créer l'utilisateur dans la base de données
      const dbUser = await this.prismaService.client.user.create({
        data: {
          keycloakId: user.id!,
          username: createAdminDto.username,
          email: createAdminDto.email,
          firstName: createAdminDto.firstName,
          lastName: createAdminDto.lastName,
          password: '',
          role: 'ADMIN',
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: dbUser.username,
          email: dbUser.email,
          role: dbUser.role,
        },
      };
    } catch (error) {
      console.error('Failed to create admin:', error);
      return {
        success: false,
        error: error.message || 'Failed to create admin',
      };
    }
  }
}
