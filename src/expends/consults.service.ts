import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expend } from './entities/expend.entity';
import { Repository } from 'typeorm';
import { MonthlyExpend } from './entities/monthly_expend.entity';
import { Category } from 'src/category/entities/category.entity';
import { ExpendsService } from './expends.service';
import { User } from 'src/users/entities/user.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { MonthlyBudget } from 'src/budgets/entities/monthly_budget.entity';
import { BudgetsService } from 'src/budgets/budgets.service';
import { ConsultMessage } from './enums/consult-message.enum';
import { ExpendException } from './classes/expend.exception.message';

@Injectable()
export class ConsultsService {
	constructor(
		@InjectRepository(Expend)
		private readonly expendRepository: Repository<Expend>,
		@InjectRepository(MonthlyExpend)
		private readonly monthlyExpendRepository: Repository<MonthlyExpend>,
		@InjectRepository(Budget)
		private readonly budgetRepository: Repository<Budget>,
		@InjectRepository(MonthlyBudget)
		private readonly monthlyBudgetRepository: Repository<MonthlyBudget>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
		private readonly expendsService: ExpendsService,
		private readonly budgetsService: BudgetsService,
	) {}

	async generateRecommendation(user: User) {
		const today = new Date();
		const yearMonth = parseInt(today.toISOString().split('-').slice(0, 2).join(''));

		const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		const remainingDays = lastDayOfMonth - today.getDate();

		const monthlyBudget = await this.budgetsService.findMonthlyBudget(user, yearMonth);
		if (!monthlyBudget) throw new NotFoundException(ExpendException.BUDGET_NOT_EXISITS);

		const monthlyExpend = await this.expendsService.findMonthlyExpend(user, yearMonth);
		if (!monthlyExpend) throw new NotFoundException(ExpendException.EXPEND_NOT_EXISITS);

		const remainingBudget = monthlyBudget.total_amount - monthlyExpend.total_amount;

		const dailyRecommendBudget = remainingBudget > 0 ? Math.round(remainingBudget / remainingDays) : 10000;
		const userMessage = this.generateMessage(remainingBudget);

		const budgets = await this.budgetRepository.find({
			where: {
				monthlyBudget: { id: monthlyBudget.id },
			},
			relations: ['category'],
		});

		const expends = await this.expendRepository.find({
			where: {
				monthlyExpend: { id: monthlyExpend.id },
			},
			relations: ['category'],
		});

		const categoryAmounts = await this.calculateCategoryAmounts(budgets, expends);

		return {
			remainingBudget,
			userMessage,
			dailyRecommendBudget,
			categoryAmounts,
		};
	}

	private async calculateCategoryAmounts(budgets: Budget[], expends: Expend[]) {
		const categoryExpends = expends.reduce((acc, expend) => {
			const categoryName = expend.category.name;
			const existingCategory = acc.find((item) => item.category === categoryName);

			if (existingCategory) {
				existingCategory.totalAmount += expend.amount;
			} else {
				acc.push({ category: categoryName, totalAmount: expend.amount });
			}

			return acc;
		}, [] as { category: string; totalAmount: number }[]);

		const budgetMap = new Map<string, Budget>(budgets.map((budget) => [budget.category.name, budget]));

		const remainingCategoryAmounts = Array.from(budgetMap, ([category, budget]) => {
			const expend = categoryExpends.find((item) => item.category === category);
			const remainingBudget = expend ? budget.amount - expend.totalAmount : budget.amount;

			return { category, remainingBudget };
		});

		return remainingCategoryAmounts;
	}

	private generateMessage(remainingBudget: number) {
		if (remainingBudget > 0) return ConsultMessage.VERY_GOOD;
		else if (remainingBudget === 0) return ConsultMessage.GOOD;
		else return ConsultMessage.BAD;
	}
}
