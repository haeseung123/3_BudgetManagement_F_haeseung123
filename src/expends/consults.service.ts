import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expend } from './entities/expend.entity';
import { Repository } from 'typeorm';
import { ExpendsService } from './expends.service';
import { User } from 'src/users/entities/user.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { BudgetsService } from 'src/budgets/budgets.service';
import { ConsultMessage } from './enums/consult-message.enum';
import { ExpendException } from './classes/expend.exception.message';

@Injectable()
export class ConsultsService {
	constructor(
		@InjectRepository(Expend)
		private readonly expendRepository: Repository<Expend>,
		@InjectRepository(Budget)
		private readonly budgetRepository: Repository<Budget>,
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
		if (!monthlyExpend) throw new NotFoundException(ExpendException.MONTHLY_EXPEND_NOT_EXISITS);

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

	private dailyCategoryBudget(budgets: Budget[], daysInCurrentMonth: number) {
		const optimalCategoryBudgets = budgets.map((budget) => {
			const categoryName = budget.category.name;
			const optimalBudget = budget.amount === 0 ? 0 : Math.round(budget.amount / daysInCurrentMonth);

			return { categoryName, optimalBudget };
		});

		return optimalCategoryBudgets;
	}

	private calculateRiskPercentage(budgetAmount: number, expendAmount: number) {
		if (budgetAmount === 0) return expendAmount;

		const exceedPercentage =
			expendAmount > budgetAmount ? Math.round(((expendAmount - budgetAmount) / budgetAmount) * 100) : 0;

		return exceedPercentage;
	}

	async getTodayExpend(user: User) {
		const today = new Date();
		const dateParts = today.toISOString().split('T')[0].split('-');
		const [year, month, day] = dateParts.map((v) => parseInt(v));
		const yearMonth = year * 100 + month;

		const daysInCurrentMonth = new Date(year, month, 0).getDate();

		// 오늘 카테고리별 지출 금액
		const monthlyExpend = await this.expendsService.findMonthlyExpend(user, yearMonth);
		if (!monthlyExpend) throw new NotFoundException(ExpendException.MONTHLY_EXPEND_NOT_EXISITS);

		const todayExpend = await this.expendRepository.find({
			where: {
				monthlyExpend: { id: monthlyExpend.id },
				day: day,
			},
			relations: ['category'],
		});

		const todayAmount = todayExpend.reduce((acc, expend) => (acc += expend.amount), 0);

		// 오늘 적정 금액
		const monthlyBudget = await this.budgetsService.findMonthlyBudget(user, yearMonth);
		const budgets = await this.budgetRepository.find({
			where: {
				monthlyBudget: { id: monthlyBudget.id },
			},
			relations: ['category'],
		});

		const todayOptimalBudget = this.dailyCategoryBudget(budgets, daysInCurrentMonth);

		// 오늘 지출 위험도
		const todayRiskPercentage: any[] = [];
		budgets.forEach((budget) => {
			const categoryName = budget.category.name;
			const matchingExpend = todayExpend.find((expend) => expend.category.name === categoryName);

			if (matchingExpend) {
				let riskPercentage = this.calculateRiskPercentage(budget.amount, matchingExpend.amount);
				todayRiskPercentage.push({ category: categoryName, riskPercentage: `${riskPercentage}%` });
			}
			todayRiskPercentage.push({ category: categoryName, riskPercentage: '0%' });
		});

		return {
			todayExpend,
			todayAmount,
			todayOptimalBudget,
			todayRiskPercentage,
		};
	}
}
