import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { ExpendsService } from './expends.service';
import { AtGuard } from 'src/auth/guard/access.token.guard';
import { GetUser } from 'src/global/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateExpendDto } from './dto/create-expend.dto';
import { UpdateExpendDto } from './dto/update-expend.dto';
import { CustomParseUUIDPipe } from 'src/global/pipes/custom-parse-uuid.pipe';
import { JwtExceptionFilter } from 'src/global/filters/jwt-exception.filter';
import { HttpExceptionFilter } from 'src/global/filters/http-exception.filter';
import { ResponseMessage } from 'src/global/decorators/response-key.decorator';
import { ExpendResponseMessage } from './classes/expend.response.message';
import { GetExpendDto } from './dto/get-expend.dto';
import { ConsultsService } from './consults.service';

@Controller('expends')
@UseFilters(JwtExceptionFilter, HttpExceptionFilter)
export class ExpendsController {
	constructor(private readonly expendsService: ExpendsService, private readonly consultsService: ConsultsService) {}

	@Post()
	@UseGuards(AtGuard)
	@ResponseMessage(ExpendResponseMessage.CREATE)
	async createExpend(@GetUser() user: User, @Body() createExpendDto: CreateExpendDto) {
		return await this.expendsService.createExpend(user, createExpendDto);
	}

	@Patch(':id')
	@UseGuards(AtGuard)
	@ResponseMessage(ExpendResponseMessage.UPDATE)
	async updateExpend(
		@Param('id', CustomParseUUIDPipe) id: string,
		@GetUser() user: User,
		@Body() updateExpendDto: UpdateExpendDto,
	) {
		return await this.expendsService.updateExpend(id, user, updateExpendDto);
	}

	@Delete(':id')
	@UseGuards(AtGuard)
	@HttpCode(204)
	async deleteExpend(@Param('id', CustomParseUUIDPipe) id: string, @GetUser() user: User) {
		return await this.expendsService.deleteExpend(id, user);
	}

	@Get()
	@UseGuards(AtGuard)
	@ResponseMessage(ExpendResponseMessage.GET)
	async getExpend(@Query() getExpendDto: GetExpendDto, @GetUser() user: User) {
		return await this.expendsService.getExpend(getExpendDto, user);
	}

	@Get('consults/recommend')
	@UseGuards(AtGuard)
	@ResponseMessage(ExpendResponseMessage.RECOMMEND)
	async getRecommendation(@GetUser() user: User) {
		return await this.consultsService.generateRecommendation(user);
	}

	@Get('consults/today')
	@UseGuards(AtGuard)
	async getTodayExpend() {}
}
