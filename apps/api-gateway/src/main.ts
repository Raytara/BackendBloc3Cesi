import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origine: 'http://localhost:4000', 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  }); 

  await app.listen(process.env.PORT ?? 3000);
  console.log('API Gateway is running on http://localhost:3000');
}
bootstrap();
