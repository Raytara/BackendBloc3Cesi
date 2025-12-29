import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateConversationDto, SendMessageDto } from './dto/conversation.dto';

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

  @MessagePattern('find_or_create_conversation')
  findOrCreateConversation(@Payload() data: CreateConversationDto) {
    return this.appService.findOrCreateConversation(data);
  }

  @MessagePattern('send_message')
  sendMessage(@Payload() data: SendMessageDto) {
    return this.appService.sendMessage(data);
  }

  @MessagePattern('get_messages')
  getMessages(@Payload() conversationId: string) {
    return this.appService.getMessages(conversationId);
  }

  @MessagePattern('get_user_conversations')
  getUserConversations(@Payload() userId: string) {
    return this.appService.getUserConversations(userId);
  }

  @MessagePattern('delete_review')
  deleteReview(@Payload() data: { reviewId: string; userId: string }) {
    return this.appService.deleteReview(data.reviewId, data.userId);
  }
}
