import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule as Jwt } from '@nestjs/jwt';

@Module({
	imports: [Jwt.register({})],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
