import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID de la commande',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId: string;

  @ApiProperty({
    description: "ID de l'acheteur",
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  buyerId: string;

  @ApiProperty({
    description: 'ID du vendeur',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  sellerId: string;
}
