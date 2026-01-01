export class CreateAdminDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  adminId: string; // ID de l'admin qui crée le compte
}
