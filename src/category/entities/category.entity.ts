import { Column, Entity } from 'typeorm';
import { BudgetCategory } from 'src/global/enums/budget-category.enum';
import { BaseEntity } from '../../global/entities/base.entity';

@Entity()
export class Category extends BaseEntity {
	@Column({
		type: 'enum',
		enum: BudgetCategory,
	})
	name: BudgetCategory;
}
