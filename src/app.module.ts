import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { validationSchema } from './global/configs/validation.schema';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import jwtConfiguration from './global/configs/jwt.configuration';
import { APP_FILTER } from '@nestjs/core';
import { NotFoundExceiptionFilter } from './global/filters/not-found-exception.filter';
import { BudgetsModule } from './budgets/budgets.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [jwtConfiguration],
			envFilePath: `.${process.env.NODE_ENV}.env`,
			validationSchema,
		}),
		DatabaseModule,
		UsersModule,
		AuthModule,
		CategoryModule,
		BudgetsModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: NotFoundExceiptionFilter,
		},
	],
})
export class AppModule {}
