import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID de la conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  conversationId: string;

  @ApiProperty({
    description: 'Contenu du message',
    example: "Bonjour, j'ai une question sur le produit...",
  })
  content: string;
}
