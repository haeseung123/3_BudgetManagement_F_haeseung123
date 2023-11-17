import { Module } from '@nestjs/common';
import { ExpendsController } from './expends.controller';
import { ExpendsService } from './expends.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expend } from './entities/expend.entity';
import { MonthlyExpend } from './entities/monthly_expend.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { ConsultsService } from './consults.service';
import { Budget } from 'src/budgets/entities/budget.entity';
import { MonthlyBudget } from 'src/budgets/entities/monthly_budget.entity';
import { BudgetsService } from 'src/budgets/budgets.service';
import { StatisticsService } from './statistics.service';

@Module({
	imports: [TypeOrmModule.forFeature([Expend, MonthlyExpend, User, Category, Budget, MonthlyBudget])],
	controllers: [ExpendsController],
	providers: [ExpendsService, ConsultsService, BudgetsService, StatisticsService],
})
export class ExpendsModule {}
