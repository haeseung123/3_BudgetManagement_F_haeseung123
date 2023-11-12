import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { MonthlyBudget } from './entities/monthly_budget.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Budget, MonthlyBudget, User, Category])],
	controllers: [BudgetsController],
	providers: [BudgetsService],
})
export class BudgetsModule {}
