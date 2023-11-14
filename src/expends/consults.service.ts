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
		const dateStr = today.toISOString().split('T')[0];
		const [year, month, day] = dateStr.split('-');
		const yearMonth = parseInt(year + month);

		const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		const remainingDays = lastDayOfMonth - today.getDate();

		const monthlyBudget = await this.budgetsService.findMonthlyBudget(user, yearMonth);
		const budgets = await this.budgetRepository.find({
			where: {
				monthlyBudget: { id: monthlyBudget.id },
			},
			relations: ['category'],
		});

		if (!monthlyBudget) throw new NotFoundException(ExpendException.BUDGET_NOT_EXISITS);

		const monthlyExpend = await this.expendsService.findMonthlyExpend(user, yearMonth);
		const expends = await this.expendRepository.find({
			where: {
				monthlyExpend: { id: monthlyExpend.id },
			},
			relations: ['category'],
		});

		// 남은 예산
		const remainingBudget = monthlyBudget.total_amount - monthlyExpend.total_amount;

		if (remainingBudget > 0) {
			const dailyRecommendBudget = Math.round(remainingBudget / remainingDays);

			//추천 메시지
			const userMessage = this.generateMessage(remainingBudget);

			//카테고리별 남은 예산
			const categoryAmounts = await this.calculateCategoryAmounts(budgets, expends);

			return {
				remainingBudget,
				userMessage,
				dailyRecommendBudget,
				categoryAmounts,
			};
		} else {
			const dailyRecommendBudget = 10000;
			const userMessage = this.generateMessage(remainingBudget);

			return {
				remainingBudget,
				userMessage,
				dailyRecommendBudget,
			};
		}
	}

	private async calculateCategoryAmounts(budgets: Budget[], expends: Expend[]) {
		const categoryExpends: { category: string; totalAmount: number }[] = [];

		expends.forEach((expend) => {
			const categoryName = expend.category.name;
			const existingCategory = categoryExpends.find((item) => item.category === categoryName);

			if (existingCategory) existingCategory.totalAmount += expend.amount;
			else categoryExpends.push({ category: categoryName, totalAmount: expend.amount });
		});

		const budgetMap = new Map<string, Budget>();
		budgets.forEach((budget) => {
			budgetMap.set(budget.category.name, budget);
		});

		const remainingCategoryAmounts: any[] = [];

		budgetMap.forEach((budget, category) => {
			const expend = categoryExpends.find((item) => item.category === category);

			if (expend) {
				const remainingBudget = budget.amount - expend.totalAmount;
				remainingCategoryAmounts.push({ category, remainingBudget });
			} else {
				remainingCategoryAmounts.push({ category, remainingBudget: budget.amount });
			}
		});

		return remainingCategoryAmounts;
	}

	private generateMessage(remainingBudget: number) {
		if (remainingBudget > 0) return ConsultMessage.VERY_GOOD;
		else if (remainingBudget === 0) return ConsultMessage.GOOD;
		else return ConsultMessage.BAD;
	}
}
