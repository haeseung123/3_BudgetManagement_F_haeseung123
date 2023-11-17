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
import { StatisticsService } from './statistics.service';

@Controller('expends')
@UseGuards(AtGuard)
@UseFilters(JwtExceptionFilter, HttpExceptionFilter)
export class ExpendsController {
	constructor(
		private readonly expendsService: ExpendsService,
		private readonly consultsService: ConsultsService,
		private readonly statisticsService: StatisticsService,
	) {}

	@Post()
	@ResponseMessage(ExpendResponseMessage.CREATE)
	async createExpend(@GetUser() user: User, @Body() createExpendDto: CreateExpendDto) {
		return await this.expendsService.createExpend(user, createExpendDto);
	}

	@Patch(':id')
	@ResponseMessage(ExpendResponseMessage.UPDATE)
	async updateExpend(
		@Param('id', CustomParseUUIDPipe) id: string,
		@GetUser() user: User,
		@Body() updateExpendDto: UpdateExpendDto,
	) {
		return await this.expendsService.updateExpend(id, user, updateExpendDto);
	}

	@Delete(':id')
	@HttpCode(204)
	async deleteExpend(@Param('id', CustomParseUUIDPipe) id: string, @GetUser() user: User) {
		return await this.expendsService.deleteExpend(id, user);
	}

	@Get()
	@ResponseMessage(ExpendResponseMessage.GET)
	async getExpend(@Query() getExpendDto: GetExpendDto, @GetUser() user: User) {
		return await this.expendsService.getExpend(getExpendDto, user);
	}

	@Get('consults/recommend')
	@ResponseMessage(ExpendResponseMessage.RECOMMEND)
	async getRecommendation(@GetUser() user: User) {
		return await this.consultsService.generateRecommendation(user);
	}

	@Get('consults/today')
	@ResponseMessage(ExpendResponseMessage.TODAY)
	async getTodayExpend(@GetUser() user: User) {
		return await this.consultsService.getTodayExpend(user);
	}

	@Get('statistics')
	@ResponseMessage(ExpendResponseMessage.STATISTICS)
	async getStatistics(@GetUser() user: User) {
		return await this.statisticsService.generateStatistics(user);
	}
}
