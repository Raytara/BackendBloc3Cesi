import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: "Titre de l'article", example: 'iPhone 14 Pro' })
  title: string;

  @ApiProperty({
    description: "ID de l'auteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authorId: string;

  @ApiPropertyOptional({
    description: "Description de l'article",
    example: 'iPhone 14 Pro en excellent état',
  })
  description?: string;

  @ApiProperty({ description: "Prix de l'article en euros", example: 999.99 })
  price: number;

  @ApiPropertyOptional({ description: 'Quantité en stock', example: 10 })
  stock?: number;

  @ApiPropertyOptional({
    description: 'ID de la boutique',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  boutiqueId?: string;

  @ApiProperty({
    description: 'ID de la catégorie',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  categoryId: string;

  @ApiProperty({
    description: 'ID du vendeur',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  sellerId: string;
}
