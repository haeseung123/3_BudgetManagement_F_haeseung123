import { IsNotEmpty, IsString, MinLength, Matches, MaxLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty({ message: '계정은 필수 입력 필드입니다.' })
	account: string;

	@IsString()
	@MinLength(8, { message: '패스워드는 8자리 이상이어야 합니다.' })
	@Matches(/^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{10,}$/, {
		message: '패스워드는 숫자, 문자, 특수문자 중 2가지 이상을 포함해야 합니다.',
	})
	@IsNotEmpty({ message: '패스워드는 필수 입력 필드입니다.' })
	password: string;

	@IsString()
	@MaxLength(10, { message: '이름은 10자 이내여야 합니다.' })
	@IsNotEmpty({ message: '이름은 필수 입력 필드입니다.' })
	name: string;
}
