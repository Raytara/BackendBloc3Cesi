import { Body, Post, Controller, Get, HttpCode, HttpStatus, Inject, Res } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response } from 'express';
import { map } from 'rxjs/operators';

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
  loginUser(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    return this.usersClient.send<{ access_token: string; refresh_token: string }>('login_user', loginUserDto).pipe(
      map((tokens) => {
        res.cookie('access_token', tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600 * 1000, // 1 heure
        });

        res.cookie('refresh_token', tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 3600 * 1000, // 7 jours
        });

        return tokens;
      })
    );
  }

  @Post('logout')
  logoutUser(@Body('refresh_token') refresh_token: string, @Res({ passthrough: true }) res: Response): Observable<{ message: string }> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return this.usersClient.send<{ message: string }>('logout_user', { refresh_token });
  }
}
