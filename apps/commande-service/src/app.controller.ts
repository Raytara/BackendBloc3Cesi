import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Controller('commande')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('hello_commande_service')
  getHelloFromMicroservice(): string {
    return 'Hello from Commande Microservice!';
  }

  @MessagePattern('create_payment_session')
  async createPaymentSession(@Payload() createPaymentSessionDto: CreatePaymentSessionDto): Promise<string> {
    return this.appService.createPaymentSession(createPaymentSessionDto);
  }

  @EventPattern('payment_succeeded')
  async handlePaymentSucceeded(@Payload() data: any) {
    return this.appService.handlePaymentSuccess(data);
  }
}
