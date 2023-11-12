import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsBudget } from '../decorators/isBudget.decorator';

export class CreateBudgetDto {
	@IsString({ message: '년월은 문자열 형식이어야 합니다.' })
	@IsNotEmpty({ message: '년월은 필수 입력 필드입니다.' })
	@Matches(/\d{4}-(0[1-9]|1[0-2])$/, { message: 'year_month 필드는 YYYY-MM 형식이어야 합니다.' })
	year_month: string;

	@IsBudget('교육')
	education: number;

	@IsBudget('생활')
	living: number;

	@IsBudget('식비')
	food: number;

	@IsBudget('건강')
	health: number;

	@IsBudget('교통')
	transport: number;

	@IsBudget('문화')
	culture: number;

	@IsBudget('경조사')
	occasion: number;
}
