export class CreateConversationDto {
  orderId: string;
  buyerId: string;
  sellerId: string;
}

export class SendMessageDto {
  conversationId: string;
  senderId: string;
  content: string;
}
