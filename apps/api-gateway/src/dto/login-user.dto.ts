import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Adresse email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'SecurePassword123!' })
  password: string;
}
