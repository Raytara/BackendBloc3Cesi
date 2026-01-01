import { Controller, Inject, Post, Body, Req } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public, Roles } from 'nest-keycloak-connect';
import { Observable } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminService: ClientProxy,
  ) {}

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'getHello';
    const payload = {};
    return this.adminService.send<string>(pattern, payload);
  }

  @Post('categories')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (admins uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Une catégorie avec ce nom existe déjà',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle Admin requis',
  })
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ) {
    const adminId = req.user.sub; // Récupère l'ID de l'utilisateur depuis le token Keycloak
    return this.adminService.send('admin_create_category', {
      ...createCategoryDto,
      adminId,
    });
  }

  @Post('create-admin')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un nouveau compte admin (admins uniquement)',
  })
  @ApiResponse({
    status: 201,
    description: 'Compte admin créé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Un utilisateur avec cet email ou username existe déjà',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle Admin requis',
  })
  createAdmin(@Body() createAdminDto: CreateAdminDto, @Req() req: any) {
    const adminId = req.user.sub; // Récupère l'ID de l'admin qui crée le compte
    return this.adminService.send('admin_create_admin', {
      ...createAdminDto,
      adminId,
    });
  }
}
