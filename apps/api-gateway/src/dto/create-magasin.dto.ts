import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMagasinDto {
  @ApiProperty({
    description: 'ID du vendeur',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sellerId: string;

  @ApiProperty({ description: 'Nom du magasin', example: 'TechStore' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description du magasin',
    example: 'Boutique spécialisée en électronique',
  })
  description?: string;
}
