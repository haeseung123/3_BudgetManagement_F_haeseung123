import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from 'src/global/interfaces/token.payload';
import { Request } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(
		@Inject(jwtConfiguration.KEY)
		private readonly config: ConfigType<typeof jwtConfiguration>,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.refresh.secretKey,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: TokenPayload) {
		const refreshToken = req.headers.authorization.split(' ')[1];

		const isExist = await this.usersService.isUserExist({ id: payload.id });
		if (isExist) {
			const user = await this.usersService.findUser({ id: payload.id });

			if (refreshToken === user.refresh_token) return user;
		}
	}
}
