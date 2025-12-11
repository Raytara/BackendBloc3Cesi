import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly usersClient: ClientProxy) {}

  @Get('hello')
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_users_service'; 
    const payload = {}; 

    return this.usersClient.send<string>(pattern, payload);
  }
}
