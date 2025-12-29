import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentSessionDto {
  @ApiProperty({ description: 'Prix total en euros', example: 99.99 })
  price: number;

  @ApiProperty({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;
}
