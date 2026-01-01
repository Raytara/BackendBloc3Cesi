import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateCategoryDto } from './dto/create-category.dto';

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
}
