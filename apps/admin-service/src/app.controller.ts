import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('getHello')
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('admin_create_category')
  createCategory(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.appService.createCategory(createCategoryDto);
  }

  @MessagePattern('admin_create_admin')
  createAdmin(@Payload() createAdminDto: CreateAdminDto) {
    return this.appService.createAdmin(createAdminDto);
  }

  @MessagePattern('admin_get_all_users')
  getAllUsers(@Payload() data: { adminId: string }) {
    return this.appService.getAllUsers(data);
  }

  @MessagePattern('admin_ban_user')
  banUser(
    @Payload() data: { userId: string; reason?: string; adminId: string },
  ) {
    return this.appService.banUser(data);
  }

  @MessagePattern('admin_unban_user')
  unbanUser(
    @Payload() data: { userId: string; reason?: string; adminId: string },
  ) {
    return this.appService.unbanUser(data);
  }
}
