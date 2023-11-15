import { BaseEntity } from '../../global/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MonthlyExpend } from './monthly_expend.entity';
import { Category } from '../../category/entities/category.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity()
export class Expend extends BaseEntity {
	@Column()
	day: number;

	@Column()
	title: string;

	@Column({ nullable: true })
	content: string;

	@Column()
	amount: number;

	@Column({
		type: 'enum',
		enum: PaymentMethod,
	})
	payment_method: PaymentMethod;

	@Column({ default: false })
	excluded: boolean;

	@ManyToOne(() => MonthlyExpend)
	@JoinColumn({ name: 'monthly_expend_id' })
	monthlyExpend: MonthlyExpend;

	@ManyToOne(() => Category)
	@JoinColumn({ name: 'category_id' })
	category: Category;
}
