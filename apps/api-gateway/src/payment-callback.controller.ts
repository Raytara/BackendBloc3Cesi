import { Controller, Get, Inject, Query } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';

@Controller()
export class PaymentCallbackController {
  private stripe: Stripe;

  constructor(@Inject('COMMANDE_SERVICE') private readonly commandeClient: ClientProxy) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-12-15.clover',
    });
  }

  @Get('success')
  @Public()
  async handleSuccess(@Query('session_id') sessionId: string) {
    if (sessionId) {
      try {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          this.commandeClient.emit('payment_succeeded', session);
          return {
            message: 'Paiement réussi et validé avec les données réelles !',
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency,
            customer: session.customer_details?.email
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session Stripe:', error);
      }
    }

    return {
      message: 'Paiement réussi ! (Données non récupérées)',
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
