import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BanUserDto {
  @ApiProperty({
    required: false,
    description: 'Raison du bannissement/débannissement',
    example: 'Comportement inapproprié',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
