import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'article_queue',
      queueOptions: {
        durable: false
      },
    },
  });
  await app.listen(); 
  console.log('Article microservice is listening via RabbitMQ');
}
bootstrap();
