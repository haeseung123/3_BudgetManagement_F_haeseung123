import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { UsersService } from 'src/users/users.service';
import { ConfigType } from '@nestjs/config';
import { TokenPayload } from 'src/global/interfaces/token.payload';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'access') {
	constructor(
		@Inject(jwtConfiguration.KEY)
		private readonly config: ConfigType<typeof jwtConfiguration>,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.access.secretKey,
		});
	}

	async validate(payload: TokenPayload) {
		const isExist = await this.usersService.isUserExist({ id: payload.id });
		if (isExist) return await this.usersService.findUser({ id: payload.id });
	}
}
