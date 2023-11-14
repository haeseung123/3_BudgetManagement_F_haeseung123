import { ExceptionObjError } from 'src/global/enums/exception-obj-error.enum';
import { ExceptionObj } from 'src/global/interfaces/exception.obj';

export class ExpendException {
	static EXPEND_UPDATE_FORBIDDEN: ExceptionObj = {
		message: '업데이트 권한이 없는 사용자입니다.',
		error: ExceptionObjError.FORBIDDEN,
	};

	static EXPEND_NOT_EXISITS: ExceptionObj = {
		message: '존재하지 않는 지출입니다.',
		error: ExceptionObjError.NOT_FOUND,
	};

	static EXPEND_NOT_EXISITS_FROM_USER: ExceptionObj = {
		message: '사용자의 지출이 존재하지 않습니다.',
		error: ExceptionObjError.NOT_FOUND,
	};

	static BUDGET_NOT_EXISITS: ExceptionObj = {
		message: '예산이 존재하지 않습니다.',
		error: ExceptionObjError.NOT_FOUND,
	};
}
