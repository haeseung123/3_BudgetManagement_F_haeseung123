import { ExceptionFilter, Catch, ArgumentsHost, NotAcceptableException } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotAcceptableException)
export class NotAcceptableExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const exceptionObj = exception.getResponse();

		response.status(status).json({
			success: false,
			statusCode: status,
			error: exceptionObj['error'],
			message: exceptionObj['message'],
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
