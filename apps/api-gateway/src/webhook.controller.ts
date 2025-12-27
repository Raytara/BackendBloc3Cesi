import { Controller, Post, Headers, Req, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Stripe from 'stripe';
import type { Request } from 'express';
import { Public } from 'nest-keycloak-connect';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(@Inject('COMMANDE_SERVICE') private readonly commandeClient: ClientProxy) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-12-15.clover',
    });
  }

  @Post()
  @Public()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: Request) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        (request as any).rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Emit event to commande-service
      this.commandeClient.emit('payment_succeeded', session);
    }

    return { received: true };
  }
}
