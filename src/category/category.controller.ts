import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResponseMessage } from './classes/category.response.message';
import { ResponseMessage } from 'src/global/decorators/response-key.decorator';
import { AtGuard } from 'src/auth/guard/access.token.guard';
import { JwtExceptionFilter } from 'src/global/filters/jwt-exception.filter';

@Controller('category')
@UseFilters(JwtExceptionFilter)
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@UseGuards(AtGuard)
	@ResponseMessage(CategoryResponseMessage.GET_CATEGORIES)
	async getAll() {
		return await this.categoryService.getAll();
	}
}
