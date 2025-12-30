import { Controller, Inject } from "@nestjs/common";
import { Get } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Public } from "nest-keycloak-connect";
import { Observable } from "rxjs";

@Controller('admin')
export class AdminController {
  constructor(@Inject('ADMIN_SERVICE') private readonly adminService: ClientProxy) {}

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'getHello';
    const payload = {};
    return this.adminService.send<string>(pattern, payload);
  }
}