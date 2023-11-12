import { BaseEntity } from 'src/global/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MonthlyBudget } from './monthly_budget.entity';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Budget extends BaseEntity {
	@Column()
	amount: number;

	@ManyToOne(() => MonthlyBudget)
	@JoinColumn({ name: 'monthly_budget_id' })
	monthlyBudget: MonthlyBudget;

	@ManyToOne(() => Category)
	@JoinColumn({ name: 'category_id' })
	category: Category;
}
