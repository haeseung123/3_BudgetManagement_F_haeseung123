import { BaseEntity } from '../../global/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'monthly_expend' })
export class MonthlyExpend extends BaseEntity {
	@Column()
	year_month: number;

	@Column()
	total_amount: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;
}
