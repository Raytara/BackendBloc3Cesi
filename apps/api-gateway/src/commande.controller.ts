import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Public } from "nest-keycloak-connect";
import { CreatePaymentSessionDto } from "./dto/create-payment-session.dto";

@Controller("commande")
export class CommandeController {
  constructor(@Inject('COMMANDE_SERVICE') private readonly commandeClient: ClientProxy) { }

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_commande_service';
    const payload = {};
    
    return this.commandeClient.send<string>(pattern, payload);
  }

  @Post('create-payment-session')
  @Public()
  createPaymentSession(@Body() createPaymentSessionDto: CreatePaymentSessionDto): Observable<string> {
    return this.commandeClient.send<string>('create_payment_session', createPaymentSessionDto);
  }
}
