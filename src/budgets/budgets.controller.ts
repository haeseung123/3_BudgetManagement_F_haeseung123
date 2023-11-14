import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { AtGuard } from 'src/auth/guard/access.token.guard';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { GetUser } from 'src/global/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ResponseMessage } from 'src/global/decorators/response-key.decorator';
import { BudgetResponseMessage } from './classes/budget.response.message';
import { JwtExceptionFilter } from 'src/global/filters/jwt-exception.filter';

@Controller('budgets')
@UseFilters(JwtExceptionFilter)
export class BudgetsController {
	constructor(private readonly budgetsService: BudgetsService) {}

	@Post()
	@UseGuards(AtGuard)
	@ResponseMessage(BudgetResponseMessage.CREATE)
	async createBudget(@GetUser() user: User, @Body() createBudgetDto: CreateBudgetDto) {
		return await this.budgetsService.createBudget(user, createBudgetDto);
	}
}
