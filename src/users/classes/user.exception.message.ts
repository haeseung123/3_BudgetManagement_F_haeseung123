import { ExceptionObjError } from 'src/global/enums/exception-obj-error.enum';
import { ExceptionObj } from 'src/global/interfaces/exception.obj';

export class UsersException {
	static USER_ACCOUNT_ALREADY_EXISTS: ExceptionObj = {
		message: '이미 회원가입 되어있는 계정입니다.',
		error: ExceptionObjError.CONFLICT,
	};
	static USER_NOT_EXISTS: ExceptionObj = {
		message: '존재하지 않는 계정입니다.',
		error: ExceptionObjError.BAD_REQUEST,
	};

	static USER_PASSWORD_NOT_MATCHED: ExceptionObj = {
		message: '패스워드가 일치하지 않습니다.',
		error: ExceptionObjError.BAD_REQUEST,
	};
}
