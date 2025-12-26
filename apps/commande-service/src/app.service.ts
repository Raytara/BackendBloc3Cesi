import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Injectable()
export class AppService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-12-15.clover',
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  async createPaymentSession(createPaymentSessionDto: CreatePaymentSessionDto): Promise<string> {
    const { price, productId } = createPaymentSessionDto;
    const commission = price * 0.05;
    const totalAmount = price + commission;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Product ${productId}`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    return session.url || '';
  }
}
