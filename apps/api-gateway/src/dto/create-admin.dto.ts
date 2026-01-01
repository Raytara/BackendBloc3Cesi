import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: "Nom d'utilisateur de l'admin",
    example: 'admin_john',
  })
  username: string;

  @ApiProperty({
    description: "Adresse email de l'admin",
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Mot de passe (définitif)',
    example: 'SecureAdminPassword123!',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Prénom',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nom de famille',
    example: 'Doe',
  })
  lastName?: string;
}
