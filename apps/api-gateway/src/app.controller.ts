import { Body, Post, Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class AppController {
  constructor(@Inject('USER_SERVICE') private readonly usersClient: ClientProxy) { }

  @Get('hello')
  @Public()
  getHelloFromMicroservice(): Observable<string> {
    const pattern = 'hello_users_service'; 
    const payload = {}; 

    return this.usersClient.send<string>(pattern, payload);
  }

  @Post()
  @Public()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersClient.send('create_user', createUserDto);
  }

  @Post('login')
  @Public()
  loginUser(@Body() loginUserDto: LoginUserDto): Observable<{ accessToken: string }> {
    return this.usersClient.send<{ accessToken: string }>('login_user', loginUserDto);
  }
}
