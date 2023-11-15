import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../global/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@Column()
	account: string;

	@Column()
	@Exclude()
	password: string;

	@Column()
	name: string;

	@Column({ nullable: true })
	@Exclude()
	refresh_token: string;
}
