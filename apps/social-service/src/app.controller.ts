import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('hello_social_service')
  getHelloMessage(): string {
    return this.appService.getHello();
  }

  @MessagePattern('create_review')
  createReview(@Payload() createReviewDto: CreateReviewDto) {
    return this.appService.createReview(createReviewDto);
  }

  @MessagePattern('get_reviews')
  getReviews(@Payload() targetId: string) {
    return this.appService.getReviews(targetId);
  }
}
