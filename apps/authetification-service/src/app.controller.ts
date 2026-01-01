import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LogoutUserDto } from './dto/logout-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { BecomeSellerDto } from './dto/become-seller.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('hello_users_service')
  getHello(): string {
    console.log('[UsersService] Message hello reçu');
    return 'Hello world from Users Microservice';
  }

  @MessagePattern('create_user')
  async createUser(@Payload() data: CreateUserDto) {
    return await this.appService.createUser(data);
  }

  @MessagePattern('login_user')
  async loginUser(@Payload() data: LoginUserDto) {
    return await this.appService.login(data);
  }

  @MessagePattern('become_seller')
  async becomeSeller(@Payload() data: BecomeSellerDto) {
    return await this.appService.becomeSeller(data);
  }

  @MessagePattern('logout_user')
  async logoutUser(@Payload() data: LogoutUserDto) {
    return await this.appService.logout(data);
  }

  @MessagePattern('refresh_token')
  async refreshToken(@Payload() data: RefreshTokenDto) {
    return await this.appService.refreshToken(data);
  }

  @MessagePattern('create_admin_user')
  async createAdmin(@Payload() data: CreateAdminDto) {
    return await this.appService.createAdmin(data);
  }
}
