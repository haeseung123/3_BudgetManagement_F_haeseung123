import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AtStrategy } from 'src/auth/strategy/access.token.strategy';
import { RtStrategy } from 'src/auth/strategy/refresh.token.strategy';

@Module({
	imports: [TypeOrmModule.forFeature([User]), AuthModule],
	controllers: [UsersController],
	providers: [UsersService, AtStrategy, RtStrategy],
})
export class UsersModule {}
