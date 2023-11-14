import { Injectable, ArgumentMetadata, ParseUUIDPipe, NotAcceptableException } from '@nestjs/common';
import { GlobalException } from '../classes/global.exception.message';

@Injectable()
export class CustomParseUUIDPipe extends ParseUUIDPipe {
	async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
		try {
			return await super.transform(value, metadata);
		} catch {
			throw new NotAcceptableException(GlobalException.UUID_NOT_ACCEPTABLE);
		}
	}
}
