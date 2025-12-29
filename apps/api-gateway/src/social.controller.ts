import { Controller, Get, Post, Body, Inject, Req, Param, Delete } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Public } from "nest-keycloak-connect";
import { Observable } from "rxjs";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("social")
export class SocialController {
  constructor(@Inject("SOCIAL_SERVICE") private readonly socialClient: ClientProxy) { }

  @Get("hello")
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = "hello_social_service";
    const payload = {};

    return this.socialClient.send<string>(pattern, payload);
  }

  @Post("review")
  createReview(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send("create_review", { ...createReviewDto, authorId: userId });
  }

  @Get("reviews/:targetId")
  @Public()
  getReviews(@Param("targetId") targetId: string) {
    return this.socialClient.send("get_reviews", targetId);
  }

  @Post("conversation")
  startConversation(@Body() data: CreateConversationDto) {
    return this.socialClient.send("find_or_create_conversation", data);
  }

  @Post("message")
  sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const senderId = req.user.sub;
    return this.socialClient.send("send_message", {
      conversationId: dto.conversationId,
      content: dto.content,
      senderId: senderId,
    });
  }

  @Get('conversation/:conversationId/messages')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.socialClient.send('get_messages', conversationId);
  }

  @Get('my-conversations')
  getUserConversations(@Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send('get_user_conversations', userId);
  }

  @Delete('review/:id')
  deleteReview(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send('delete_review', { reviewId: id, userId });
  }
}
