import { ExceptionObjError } from '../enums/exception-obj-error.enum';

export interface ExceptionObj {
	message: string;
	error: ExceptionObjError;
}
