import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Req,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'nest-keycloak-connect';
import { Observable } from 'rxjs';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('social')
@Controller('social')
export class SocialController {
  constructor(
    @Inject('SOCIAL_SERVICE') private readonly socialClient: ClientProxy,
  ) {}

  @Get('hello')
  @Public()
  @ApiOperation({ summary: 'Test de connexion au service social' })
  @ApiResponse({
    status: 200,
    description: 'Message de bienvenue du service social',
  })
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_social_service';
    const payload = {};

    return this.socialClient.send<string>(pattern, payload);
  }

  @Post('review')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un avis' })
  @ApiResponse({ status: 201, description: 'Avis créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  createReview(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send('create_review', {
      ...createReviewDto,
      authorId: userId,
    });
  }

  @Get('reviews/:targetId')
  @Public()
  @ApiOperation({
    summary: "Récupérer les avis d'une cible (article ou vendeur)",
  })
  @ApiParam({
    name: 'targetId',
    description: 'ID de la cible',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Liste des avis' })
  getReviews(@Param('targetId') targetId: string) {
    return this.socialClient.send('get_reviews', targetId);
  }

  @Post('conversation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer ou trouver une conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation créée ou trouvée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  startConversation(@Body() data: CreateConversationDto) {
    return this.socialClient.send('find_or_create_conversation', data);
  }

  @Post('message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Envoyer un message dans une conversation' })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const senderId = req.user.sub;
    return this.socialClient.send('send_message', {
      conversationId: dto.conversationId,
      content: dto.content,
      senderId: senderId,
    });
  }

  @Get('conversation/:conversationId/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les messages d'une conversation" })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Liste des messages' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getMessages(@Param('conversationId') conversationId: string) {
    return this.socialClient.send('get_messages', conversationId);
  }

  @Get('my-conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mes conversations' })
  @ApiResponse({ status: 200, description: 'Liste de mes conversations' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getUserConversations(@Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send('get_user_conversations', userId);
  }

  @Delete('review/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un avis' })
  @ApiParam({
    name: 'id',
    description: "ID de l'avis",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Avis supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 403,
    description: 'Vous ne pouvez supprimer que vos propres avis',
  })
  deleteReview(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.socialClient.send('delete_review', { reviewId: id, userId });
  }
}
