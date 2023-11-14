import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Length, Matches, Min } from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { BudgetCategory } from 'src/global/enums/budget-category.enum';

export class CreateExpendDto {
	@IsString({ message: '지출일은 문자열 형식이어야 합니다.' })
	@IsNotEmpty({ message: '지출일은 필수 입력 필드입니다.' })
	@Matches(/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/, {
		message: 'year_month 필드는 YYYY-MM-DD 형식이어야 합니다.',
	})
	date: string;

	@IsString()
	@IsNotEmpty({ message: '제목은 필수 입력 필드입니다.' })
	@Length(0, 20, { message: '제목은 20자 이내로 작성해야 합니다.' })
	title: string;

	@IsString()
	@Length(0, 40, { message: '메모 내용은 40자 이내로 작성해야 합니다.' })
	content: string;

	@IsNotEmpty({ message: '지출액은 필수 입력 필드입니다.' })
	@IsNumber({}, { message: '지출액은 숫자 형식이어야 합니다.' })
	@IsInt({ message: '지출액은 정수로 입력되어야 합니다.' })
	@Min(1, { message: '0원은 허용되지 않습니다.' })
	amount: number;

	@IsNotEmpty({ message: '결제수단은 필수 입력 필드입니다.' })
	@IsEnum(PaymentMethod, {
		message: '유효하지 않은 결제수단입니다. 결제수단은 [cash, credit_card, account_transfer] 중 하나입니다.',
	})
	payment_method: PaymentMethod;

	@IsBoolean({ message: '합계 여부는 true, false 중 하나입니다.' })
	excluded: boolean;

	@IsEnum(BudgetCategory, {
		message:
			'유효하지 않은 카테고리입니다. 카테고리는 [education, living, food, health, transport, culture, occasion] 중 하나입니다.',
	})
	category: BudgetCategory;
}
