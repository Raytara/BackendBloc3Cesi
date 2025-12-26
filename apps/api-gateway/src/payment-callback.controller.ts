import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';

@Controller()
export class PaymentCallbackController {
  @Get('success')
  @Public()
  handleSuccess() {
    return {
      message: 'Paiement réussi ! Merci pour votre commande.',
    };
  }

  @Get('cancel')
  @Public()
  handleCancel() {
    return {
      message: 'Paiement annulé.',
    };
  }
}
