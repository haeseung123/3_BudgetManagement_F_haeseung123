import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UsersException } from './classes/user.exception.message';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { TokenPayload } from 'src/global/interfaces/token.payload';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly authService: AuthService,
	) {}

	async isUserExist(options: FindOptionsWhere<User>): Promise<boolean> {
		return this.userRepository.exist({ where: options });
	}

	async findUser(options: FindOptionsWhere<User>): Promise<User | null> {
		return await this.userRepository.findOne({ where: options });
	}

	async createUser(createUserDto: CreateUserDto) {
		const { account, password, name } = createUserDto;

		const isExist = await this.isUserExist({ account });
		if (isExist) throw new ConflictException(UsersException.USER_ACCOUNT_ALREADY_EXISTS);

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = this.userRepository.create({
			account,
			password: hashedPassword,
			name,
		});

		return await this.userRepository.save(newUser);
	}

	async login(loginUserDto: LoginUserDto) {
		const { account, password } = loginUserDto;

		const isExist = await this.isUserExist({ account });
		if (!isExist) throw new BadRequestException(UsersException.USER_NOT_EXISTS);

		const user = await this.findUser({ account });
		const isMatched = await bcrypt.compare(password, user.password);
		if (!isMatched) throw new BadRequestException(UsersException.USER_PASSWORD_NOT_MATCHED);

		const accessToken = await this.authService.generateAccessToken({ id: user.id, name: user.name });
		const refreshToken = await this.authService.generateRefreshToken({ id: user.id, name: user.name });

		await this.userRepository.update({ account }, { refresh_token: refreshToken });

		return {
			accessToken,
			refreshToken,
		};
	}

	async logout(user: User) {
		await this.userRepository.update({ id: user.id }, { refresh_token: null });
	}

	async refresh(user: User) {
		const payload: TokenPayload = { id: user.id, name: user.name };
		return {
			accessToken: this.authService.generateAccessToken(payload),
		};
	}
}
