import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Expend } from './entities/expend.entity';
import { ExpendsService } from './expends.service';
import { BudgetsService } from 'src/budgets/budgets.service';
import { ExpendException } from './classes/expend.exception.message';
import { MonthlyExpend } from './entities/monthly_expend.entity';
import { Budget } from 'src/budgets/entities/budget.entity';
import { MonthlyBudget } from 'src/budgets/entities/monthly_budget.entity';

@Injectable()
export class StatisticsService {
	constructor(
		@InjectRepository(Expend)
		private readonly expendRepository: Repository<Expend>,
		private readonly expendsService: ExpendsService,
	) {}

	async generateStatistics(user: User) {
		const today = new Date();
		const yearMonth = this.getYearMonth(today);
		const lastMonthDate = this.getDateOneMonthAgo(today);
		const lastYearMonth = this.getYearMonth(lastMonthDate);
		const oneWeekAgoDate = this.getDateOneWeekAgo(today);
		const oneWeekAgoYearMonth = this.getYearMonth(oneWeekAgoDate);

		const monthlyExpend = await this.expendsService.findMonthlyExpend(user, yearMonth);
		if (!monthlyExpend) throw new NotFoundException(ExpendException.EXPEND_NOT_EXISITS);

		const lastMonthlyExpend = await this.expendsService.findMonthlyExpend(user, lastYearMonth);

		const oneWeekAgoExpend = await this.expendsService.findMonthlyExpend(user, oneWeekAgoYearMonth);

		const currentExpend = await this.currentExpends(monthlyExpend, today.getDate());
		const lastMonthExpend = await this.lastMonthExpens(lastMonthlyExpend, lastMonthDate.getDate());

		//지난달 대비 소비율
		const compareExpend = await this.calculateIncreasePercentage(currentExpend, lastMonthExpend);

		//지난 요일 대비 소비율
		const todayAmount = await this.getDailyExpendAmount(monthlyExpend.id, today.getDate());

		const compareOneWeekAgoExpend = await this.compareExpendWithLastWeek(
			todayAmount,
			oneWeekAgoExpend.id,
			oneWeekAgoDate.getDate(),
		);

		return {
			comparedLastMonth: compareExpend,
			comparedOneWeekAgo: `${compareOneWeekAgoExpend}%`,
		};
	}

	private getYearMonth(date: Date): number {
		const [year, month] = date
			.toISOString()
			.split('T')[0]
			.split('-')
			.map((v) => parseInt(v));
		return year * 100 + month;
	}

	private getDateOneMonthAgo(today: Date): Date {
		return new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 1);
	}

	private getDateOneWeekAgo(today: Date): Date {
		return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
	}

	async currentExpends(monthlyExpend: MonthlyExpend, day: number) {
		console.log(monthlyExpend, day);

		const datas = await this.expendRepository.find({
			where: {
				day: Between(1, day),
				monthlyExpend: { id: monthlyExpend.id },
			},
			relations: ['category'],
		});

		const currentCategoryDatas = await this.expendsService.getAllCategoryData(datas);
		const currentCategoryArray = Object.entries(currentCategoryDatas).map(([category, totalAmount]) => ({
			category,
			totalAmount,
		}));

		return currentCategoryArray;
	}

	async lastMonthExpens(lastMonthlyExpend: MonthlyExpend, day: number) {
		console.log(lastMonthlyExpend);

		const datas = await this.expendRepository.find({
			where: {
				day: Between(1, day),
				monthlyExpend: { id: lastMonthlyExpend.id },
			},
			relations: ['category'],
		});

		const lastCategoryDatas = await this.expendsService.getAllCategoryData(datas);
		const lastCategoryArray = Object.entries(lastCategoryDatas).map(([category, totalAmount]) => ({
			category,
			totalAmount,
		}));

		return lastCategoryArray;
	}

	async calculateIncreasePercentage(currentExpend: any[], lastMonthExpend: any[]) {
		const result = [];

		for (const currentCategory of currentExpend) {
			const lastMonthCategory = lastMonthExpend.find(
				(category) => category.category === currentCategory.category,
			);

			if (lastMonthCategory) {
				const increasePercentage =
					((currentCategory.totalAmount - lastMonthCategory.totalAmount) / lastMonthCategory.totalAmount) *
					100;
				result.push({ category: currentCategory.category, increasePercentage: `${increasePercentage}%` });
			} else {
				result.push({ category: currentCategory.category, increasePercentage: '' });
			}
		}

		return result;
	}

	async getDailyExpendAmount(monthlyExpendId: string, day: number): Promise<number> {
		const todayExpend = await this.expendRepository.find({
			where: {
				day: day,
				monthlyExpend: { id: monthlyExpendId },
			},
		});

		return todayExpend.reduce((acc, expend) => (acc += expend.amount), 0);
	}

	async calculateIncreaseOneWeekAgo(todayAmount: number, oneWeekAgoExpend: number): Promise<number> {
		return Math.round(((todayAmount - oneWeekAgoExpend) / oneWeekAgoExpend) * 100);
	}

	async compareExpendWithLastWeek(todayExpend: number, lastWeekExpendId: string, day: number): Promise<number> {
		const oneWeekAgoExpend = await this.getDailyExpendAmount(lastWeekExpendId, day);

		return await this.calculateIncreaseOneWeekAgo(todayExpend, oneWeekAgoExpend);
	}
}
