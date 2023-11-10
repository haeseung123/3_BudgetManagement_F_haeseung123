import { Inject, Injectable } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import { TokenPayload } from 'src/global/interfaces/token.payload';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwt: Jwt,
		@Inject(jwtConfiguration.KEY)
		private config: ConfigType<typeof jwtConfiguration>,
	) {}

	generateAccessToken(payload: TokenPayload) {
		return this.jwt.sign(payload, {
			secret: this.config.access.secretKey,
			expiresIn: `${this.config.access.expirationTime}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt.sign(payload, {
			secret: this.config.refresh.secretKey,
			expiresIn: `${this.config.refresh.expirationTime}s`,
		});
	}
}
