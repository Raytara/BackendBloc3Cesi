import { Controller, Get, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Public } from "nest-keycloak-connect";
import { Observable } from "rxjs";

@Controller("social")
export class SocialController {
  constructor(@Inject("SOCIAL_SERVICE") private readonly socialClient: ClientProxy) { }

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_social_service';
    const payload = {};

    return this.socialClient.send<string>(pattern, payload);
  }
}