import { ExceptionObjError } from 'src/global/enums/exception-obj-error.enum';
import { ExceptionObj } from 'src/global/interfaces/exception.obj';

export class GlobalException {
	static UUID_NOT_ACCEPTABLE: ExceptionObj = {
		message: '잘못된 ID 형식입니다.',
		error: ExceptionObjError.NOT_ACCEPTABLE,
	};
}
