import { Controller, Inject, Post, Body, Req, Param } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public, Roles } from 'nest-keycloak-connect';
import { Observable } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { BanUserDto } from './dto/ban-user.dto';
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

  @Get('users')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs (admins uniquement)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle Admin requis',
  })
  getAllUsers(@Req() req: any) {
    const adminId = req.user.sub;
    return this.adminService.send('admin_get_all_users', {
      adminId,
    });
  }

  @Post('users/:userId/ban')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bannir un utilisateur (admins uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur banni avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de se bannir soi-même',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle Admin requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  banUser(
    @Param('userId') userId: string,
    @Body() banUserDto: BanUserDto,
    @Req() req: any,
  ) {
    const adminId = req.user.sub;
    return this.adminService.send('admin_ban_user', {
      userId,
      reason: banUserDto.reason,
      adminId,
    });
  }

  @Post('users/:userId/unban')
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Débannir un utilisateur (admins uniquement)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur débanni avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Rôle Admin requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  unbanUser(
    @Param('userId') userId: string,
    @Body() banUserDto: BanUserDto,
    @Req() req: any,
  ) {
    const adminId = req.user.sub;
    return this.adminService.send('admin_unban_user', {
      userId,
      reason: banUserDto.reason,
      adminId,
    });
  }
}
