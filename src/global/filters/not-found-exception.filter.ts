import { ExceptionFilter, Catch, NotFoundException, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
	catch(exception: NotFoundException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const exceptionObj = exception.getResponse();

		response.status(status).json({
			success: false,
			statusCode: status,
			error: exceptionObj['error'],
			message: '존재하지 않는 페이지입니다.',
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
