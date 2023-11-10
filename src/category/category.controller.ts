import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResponseMessage } from './classes/category.response.message';
import { ResponseMessage } from 'src/global/decorators/response-key.decorator';

@Controller('category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	@ResponseMessage(CategoryResponseMessage.GET_CATEGORIES)
	async getAll() {
		return await this.categoryService.getAll();
	}
}
