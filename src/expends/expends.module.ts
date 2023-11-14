import { Module } from '@nestjs/common';
import { ExpendsController } from './expends.controller';
import { ExpendsService } from './expends.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expend } from './entities/expend.entity';
import { MonthlyExpend } from './entities/monthly_expend.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Expend, MonthlyExpend, User, Category])],
	controllers: [ExpendsController],
	providers: [ExpendsService],
})
export class ExpendsModule {}
