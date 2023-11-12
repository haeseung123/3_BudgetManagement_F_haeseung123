import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNumber, Min } from 'class-validator';

export function IsBudget(propertyName: string) {
	return applyDecorators(
		IsNumber({}, { message: () => `${propertyName} 예산은 숫자 형식이어야 합니다.` }),
		IsInt({ message: () => `${propertyName} 예산은 정수로 입력되어야 합니다.` }),
		Min(0, { message: () => `${propertyName} 예산은 0 이상이어야 합니다.` }),
	);
}
