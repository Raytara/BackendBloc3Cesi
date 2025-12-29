import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: "Nom d'utilisateur", example: 'john_doe' })
  username: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Mot de passe',
    example: 'SecurePassword123!',
  })
  password?: string;

  @ApiPropertyOptional({ description: 'Prénom', example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Nom de famille', example: 'Doe' })
  lastName?: string;
}
