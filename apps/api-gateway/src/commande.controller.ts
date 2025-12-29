import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Public } from 'nest-keycloak-connect';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('commande')
@Controller('commande')
export class CommandeController {
  constructor(
    @Inject('COMMANDE_SERVICE') private readonly commandeClient: ClientProxy,
  ) {}

  @Get('hello')
  @Public()
  @ApiOperation({ summary: 'Test de connexion au service commande' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue du service commande',
  })
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_commande_service';
    const payload = {};

    return this.commandeClient.send<string>(pattern, payload);
  }

  @Post('create-payment-session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une session de paiement Stripe' })
  @ApiResponse({
    status: 201,
    description: 'Session de paiement créée avec succès, URL retournée',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  createPaymentSession(
    @Body() createPaymentSessionDto: CreatePaymentSessionDto,
  ): Observable<string> {
    return this.commandeClient.send<string>(
      'create_payment_session',
      createPaymentSessionDto,
    );
  }
}
