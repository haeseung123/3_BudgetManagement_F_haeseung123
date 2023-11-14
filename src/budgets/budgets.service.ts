import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { MonthlyBudget } from './entities/monthly_budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BudgetsService {
	constructor(
		@InjectRepository(Budget)
		private readonly budgetRepository: Repository<Budget>,
		@InjectRepository(MonthlyBudget)
		private readonly monthlyBudgetRepository: Repository<MonthlyBudget>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
	) {}

	async findMonthlyBudget(user: User, yearMonth: number) {
		return this.monthlyBudgetRepository.findOne({
			where: {
				user: { id: user.id },
				year_month: yearMonth,
			},
		});
	}

	async findBudget(category: Category, monthlyBudget: MonthlyBudget) {
		return this.budgetRepository.findOne({
			where: {
				category: { id: category.id },
				monthlyBudget: { id: monthlyBudget.id },
			},
		});
	}

	async createOrUpdateMonthlyBudget(user: User, yearMonth: number, totalAmount: number) {
		let monthlyBudget = await this.findMonthlyBudget(user, yearMonth);

		if (!monthlyBudget) {
			monthlyBudget = this.monthlyBudgetRepository.create({
				user: user,
				year_month: yearMonth,
				total_amount: totalAmount,
			});
			await this.monthlyBudgetRepository.save(monthlyBudget);
		}

		monthlyBudget.total_amount = 0;
		monthlyBudget.total_amount += totalAmount;
		return await this.monthlyBudgetRepository.save(monthlyBudget);
	}

	async createOrUpdateBudget(category: Category, monthlyBudget: MonthlyBudget, amount: number) {
		let budget = await this.findBudget(category, monthlyBudget);

		if (!budget) {
			budget = this.budgetRepository.create({
				category: category,
				monthlyBudget: monthlyBudget,
				amount: amount,
			});
		}
		budget.amount = amount;

		const savedBudget = await this.budgetRepository.save(budget);

		return {
			category: category.name,
			amount: savedBudget.amount,
		};
	}

	async createBudget(user: User, createBudgetDto: CreateBudgetDto) {
		const { year_month, ...budgetItems } = createBudgetDto;

		const yearMonth = parseInt(year_month.split('-').reduce((a, c) => (a += c)));

		const totalAmount = Object.values(budgetItems).reduce((acc, amount) => (acc += amount));

		const monthlyBudget = await this.createOrUpdateMonthlyBudget(user, yearMonth, totalAmount);

		const categories = await this.categoryRepository.find();

		const budgetPromises = categories.map(async (category) => {
			const categoryName = category.name;
			const amount = createBudgetDto[categoryName];

			return this.createOrUpdateBudget(category, monthlyBudget, amount);
		});

		const categoriesAmount = await Promise.all(budgetPromises);

		return {
			categoriesAmount,
			total_amount: totalAmount,
		};
	}
}
