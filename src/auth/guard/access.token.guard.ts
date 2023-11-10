import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class AtGuard extends AuthGuard('access') {
	canActivate(context: ExecutionContext) {
		return super.canActivate(context);
	}

	handleRequest(err: any, user: any) {
		if (!user) throw new JsonWebTokenError('만료됐거나 유효하지 않은 토큰입니다.');
		return user;
	}
}
