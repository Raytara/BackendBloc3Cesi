import { Controller, Get, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Public } from "nest-keycloak-connect";

@Controller("commande")
export class CommandeController {
  constructor(@Inject('COMMANDE_SERVICE') private readonly commandeClient: ClientProxy) { }

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_commande_service';
    const payload = {};
    
    return this.commandeClient.send<string>(pattern, payload);
  }
}
