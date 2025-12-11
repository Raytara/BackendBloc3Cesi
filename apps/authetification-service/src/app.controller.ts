import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
constructor(private readonly appService: AppService) {}

  @MessagePattern('hello_users_service')
  getHello(): string {
    console.log("[UsersService] Message hello reçu");
    return "Hello world from Users Microservice"; 
  }
}
