import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

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

  await app.listen(process.env.PORT ?? 3000);
  console.log('API Gateway is running on http://localhost:3000');
}
bootstrap();
