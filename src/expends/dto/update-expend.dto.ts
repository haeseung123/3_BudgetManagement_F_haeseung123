import { OmitType } from '@nestjs/mapped-types';
import { CreateExpendDto } from './create-expend.dto';

export class UpdateExpendDto extends OmitType(CreateExpendDto, ['date'] as const) {}
