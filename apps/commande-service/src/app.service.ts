import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prismaService';

@Injectable()
export class AppService {
  private stripe: Stripe;

  constructor(
    @Inject('ARTICLE_SERVICE') private articleClient: ClientProxy,
    private prisma: PrismaService
  ) {
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
      metadata: {
        productId: productId,
      },
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
    });

    return session.url || '';
  }

  async handlePaymentSuccess(session: any) {
    console.log('1. [Commande Service] Paiement validé reçu via RabbitMQ');

    const productId = session.metadata?.productId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const customerEmail = session.customer_details?.email || 'unknown';
    const customerName = session.customer_details?.name || 'unknown';

    // A. Sauvegarde en BDD via Prisma
    const newOrder = await this.prisma.client.commande.create({
      data: {
        clientName: customerName,
        clientEmail: customerEmail,
        items: JSON.stringify([{ productId, quantity: 1 }]), // Stockage simple pour l'exemple
        totalAmount: amount,
        status: 'PAID',
      }
    });

    // B. Communication vers Article Service
    if (productId) {
      this.articleClient.emit('order_confirmed', {
        orderId: newOrder.id,
        productId: productId,
        quantity: 1
      });
    } else {
    }
    // On utilise .emit() car on ne s'attend pas à une réponse immédiate (Fire and Forget)
    this.articleClient.emit('order_confirmed', newOrder);
  }
}
