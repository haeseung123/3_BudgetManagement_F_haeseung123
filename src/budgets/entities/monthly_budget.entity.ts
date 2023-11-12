import { BaseEntity } from 'src/global/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'monthly_budget' })
export class MonthlyBudget extends BaseEntity {
	@Column()
	year_month: number;

	@Column()
	total_amount: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;
}
