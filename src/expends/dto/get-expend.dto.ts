import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';
import { BudgetCategory } from 'src/global/enums/budget-category.enum';

export class GetExpendDto {
	@IsInt({ message: '조회 월은 YYYYMM 형식의 정수여야 합니다.' })
	@IsNotEmpty({ message: '조회 월은 필수 입력 쿼리입니다.' })
	month: number;

	@IsOptional()
	@IsEnum(BudgetCategory, {
		message:
			'유효하지 않은 카테고리입니다. 카테고리는 [education, living, food, health, transport, culture, occasion] 중 하나입니다.',
	})
	category: BudgetCategory;

	@IsOptional()
	min = 0; // default: 0

	@IsOptional()
	max = 5000000; // default: 5000000
}
