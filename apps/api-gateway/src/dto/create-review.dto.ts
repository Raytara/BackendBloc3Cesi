import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID de la cible (article ou vendeur)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  targetId: string;

  @ApiProperty({
    description: 'Note de 1 à 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiPropertyOptional({
    description: "Commentaire de l'avis",
    example: 'Excellent produit, très satisfait !',
  })
  comment?: string;
}
