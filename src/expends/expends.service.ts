import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expend } from './entities/expend.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MonthlyExpend } from './entities/monthly_expend.entity';
import { Category } from 'src/category/entities/category.entity';
import { CreateExpendDto } from './dto/create-expend.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateExpendDto } from './dto/update-expend.dto';
import { ExpendException } from './classes/expend.exception.message';
import { GetExpendDto } from './dto/get-expend.dto';
import { BudgetCategory } from 'src/global/enums/budget-category.enum';

@Injectable()
export class ExpendsService {
	constructor(
		@InjectRepository(Expend)
		private readonly expendRepository: Repository<Expend>,
		@InjectRepository(MonthlyExpend)
		private readonly monthlyExpendRepository: Repository<MonthlyExpend>,
		@InjectRepository(Category)
		private readonly categoryRepository: Repository<Category>,
	) {}

	async findCategory(option: FindOptionsWhere<Category>) {
		return this.categoryRepository.findOne({ where: option });
	}

	async findMonthlyExpend(user: User, yearMonth: number) {
		return this.monthlyExpendRepository.findOne({
			where: {
				user: { id: user.id },
				year_month: yearMonth,
			},
		});
	}

	async findJoinExpend(expendId: string) {
		return await this.expendRepository.findOne({
			where: {
				id: expendId,
			},
			relations: ['monthlyExpend'],
		});
	}

	async findUser(monthlyExpend: MonthlyExpend) {
		const joinUser = await this.monthlyExpendRepository.findOne({
			where: {
				id: monthlyExpend.id,
			},
			relations: ['user'],
		});

		if (!joinUser) throw new NotFoundException(ExpendException.EXPEND_NOT_EXISITS_FROM_USER);

		return joinUser.user;
	}

	async createMonthlyExpend(user: User, yearMonth: number, amount: number, excluded: boolean) {
		let monthlyExpend = await this.findMonthlyExpend(user, yearMonth);

		if (!monthlyExpend) {
			monthlyExpend = this.monthlyExpendRepository.create({
				user: user,
				year_month: yearMonth,
				total_amount: 0,
			});
			await this.monthlyExpendRepository.save(monthlyExpend);
		}

		monthlyExpend.total_amount = await this.calculateTotalAmount(amount, monthlyExpend, yearMonth);

		return await this.monthlyExpendRepository.save(monthlyExpend);
	}

	private async calculateTotalAmount(
		amount: number,
		monthlyExpend: MonthlyExpend,
		yearMonth: number,
	): Promise<number> {
		const amounts = await this.expendRepository.find({
			where: {
				excluded: false,
				monthlyExpend: {
					year_month: yearMonth,
					user: monthlyExpend.user,
				},
			},
		});

		const totalAmount = amounts.reduce((acc, c) => (acc += c.amount), amount);

		return totalAmount;
	}

	private async updateMonthlyExpendTotalAmount(monthlyExpend: MonthlyExpend, yearMonth: number): Promise<void> {
		const totalAmount = await this.calculateTotalAmount(0, monthlyExpend, yearMonth);
		monthlyExpend.total_amount = totalAmount;

		await this.monthlyExpendRepository.save(monthlyExpend);
	}

	async createExpend(user: User, createExpendDto: CreateExpendDto) {
		const { date, title, content, amount, payment_method, excluded, category } = createExpendDto;

		const dateParts = date.split('-');
		const yearMonth = parseInt(dateParts[0] + dateParts[1]);
		const day = parseInt(dateParts[2]);

		const monthlyExpend = await this.createMonthlyExpend(user, yearMonth, amount, excluded);

		const foundCategory = await this.findCategory({ name: category });

		const expend = await this.expendRepository.create({
			day,
			title,
			content,
			amount,
			excluded,
			payment_method,
			category: foundCategory,
			monthlyExpend: monthlyExpend,
		});

		return await this.expendRepository.save(expend);
	}

	async updateExpend(id: string, user: User, updateExpendDto: UpdateExpendDto) {
		const { title, content, amount, payment_method, excluded, category } = updateExpendDto;

		const joinExpend = await this.findJoinExpend(id);

		if (!joinExpend) throw new NotFoundException(ExpendException.EXPEND_NOT_EXISITS);

		const monthlyExpend = joinExpend.monthlyExpend;
		const yearMonth = monthlyExpend.year_month;

		const foundCategory = await this.findCategory({ name: category });

		const foundUser = await this.findUser(monthlyExpend);
		if (foundUser.id !== user.id) throw new ForbiddenException(ExpendException.EXPEND_UPDATE_FORBIDDEN);

		joinExpend.title = title;
		joinExpend.content = content;
		joinExpend.payment_method = payment_method;
		joinExpend.amount = amount;
		joinExpend.excluded = excluded;
		joinExpend.category = foundCategory;

		const savedExpend = await this.expendRepository.save(joinExpend);

		await this.updateMonthlyExpendTotalAmount(monthlyExpend, yearMonth);

		return {
			savedExpend,
			savedMonthlyExpend: monthlyExpend,
		};
	}

	async deleteExpend(id: string, user: User) {
		const expend = await this.findJoinExpend(id);
		if (!expend) throw new NotFoundException(ExpendException.EXPEND_NOT_EXISITS);

		const monthlyExpend = expend.monthlyExpend;
		const yearMonth = monthlyExpend.year_month;

		const foundUser = await this.findUser(monthlyExpend);
		if (foundUser.id !== user.id) throw new ForbiddenException(ExpendException.EXPEND_UPDATE_FORBIDDEN);

		await this.expendRepository.remove(expend);

		await this.updateMonthlyExpendTotalAmount(monthlyExpend, yearMonth);
	}

	private getRangeData(min: number, max: number, data: Expend) {
		const rangeAmount = data.amount;
		return rangeAmount >= min && rangeAmount <= max ? data : null;
	}

	private async getFilteredData(datas: Expend[], min: number, max: number) {
		const filterData = datas.map((expend) => this.getRangeData(min, max, expend)).filter(Boolean);
		const allCategorySumData = await this.getAllCategoryData(filterData);
		const sumFilterData = filterData.reduce((acc, c) => acc + c.amount, 0);

		return { filterData, allCategorySumData, sumFilterData };
	}

	// async getALLData(month: number, user: User, min: number, max: number) {

	// 	const filterData = datas
	// 		.map((expend) => this.getRangeData(min, max, expend))
	// 		.filter((rangeData) => rangeData !== undefined);

	// 	const allCategorySumData = await this.getAllCategoryData(filterData);

	// 	const sumFilterData = filterData.reduce((acc, c) => (acc += c.amount), 0);

	// 	return {
	// 		data: {
	// 			filterData,
	// 			allCategorySumData,
	// 		},
	// 		meta: {
	// 			sumFilterData,
	// 			totalAmount,
	// 		},
	// 	};
	// }

	async getAllCategoryData(filterData: Expend[]) {
		const categorySumData = filterData.reduce((acc, expend) => {
			const categoryName = expend.category.name;

			if (!acc[categoryName]) {
				acc[categoryName] = 0;
			}

			acc[categoryName] += expend.amount;

			return acc;
		}, {});

		return categorySumData;
	}

	async getCategoryData(datas: Expend[], category: BudgetCategory, min: number, max: number) {
		const foundCategory = await this.findCategory({ name: category });
		const categoryId = foundCategory.id;

		const categoryData = datas.filter((v) => v.category.id === categoryId);

		const filterData = categoryData.map((expend) => this.getRangeData(min, max, expend)).filter(Boolean);

		const allCategorySumData = await this.getAllCategoryData(filterData);

		return {
			filterData,
			allCategorySumData,
		};
	}

	async getExpend(getExpendDto: GetExpendDto, user: User) {
		const { month, min, max, category } = getExpendDto;
		const monthData = await this.findMonthlyExpend(user, month);
		const totalAmount = monthData.total_amount;

		const datas = await this.expendRepository.find({
			where: {
				monthlyExpend: { id: monthData.id },
			},
			relations: ['category'],
		});

		if (category) return await this.getCategoryData(datas, category, min, max);

		const allData = await this.getFilteredData(datas, min, max);
		return {
			allData,
			meta: {
				totalAmount,
			},
		};
	}
}
