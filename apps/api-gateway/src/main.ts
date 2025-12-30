import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', {
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  });

  app.enableCors({
    origin: 'http://localhost:4000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription(
      "Documentation de l'API Gateway pour le projet Marketplace en microservices",
    )
    .setVersion('1.0')
    .addTag('users', 'Gestion des utilisateurs et authentification')
    .addTag('articles', 'Gestion des articles et magasins')
    .addTag('commande', 'Gestion des commandes et paiements')
    .addTag('social', 'Gestion des avis et conversations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('API Gateway is running on http://localhost:3000');
  console.log('Swagger documentation available at http://localhost:3000/api');
}
bootstrap();
