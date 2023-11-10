import { Body, Controller, HttpCode, Post, UseFilters, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { HttpExceptionFilter } from 'src/global/filters/http-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseMessage } from 'src/global/decorators/response-key.decorator';
import { UserResponseMessage } from './classes/user.response.message';
import { LoginUserDto } from './dto/login-user.dto';
import { AtGuard } from 'src/auth/guard/access.token.guard';
import { GetUser } from 'src/global/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RtGuard } from 'src/auth/guard/refresh.token.guard';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('signup')
	@ResponseMessage(UserResponseMessage.SIGN_UP)
	async signUp(@Body() createUserDto: CreateUserDto) {
		return await this.usersService.createUser(createUserDto);
	}

	@Post('login')
	@ResponseMessage(UserResponseMessage.LOG_IN)
	async login(@Body() loginUserDto: LoginUserDto) {
		return await this.usersService.login(loginUserDto);
	}

	@Post('logout')
	@UseGuards(AtGuard)
	@HttpCode(204)
	async logout(@GetUser() user: User) {
		await this.usersService.logout(user);
	}

	@Post('refresh')
	@UseGuards(RtGuard)
	@ResponseMessage(UserResponseMessage.REFRESH)
	async refresh(@GetUser() user: User) {
		return await this.usersService.refresh(user);
	}
}
