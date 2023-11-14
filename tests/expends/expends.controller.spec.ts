import { Test, TestingModule } from '@nestjs/testing';
import { ExpendsController } from '../../src/expends/expends.controller';

describe('ExpendsController', () => {
	let controller: ExpendsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ExpendsController],
		}).compile();

		controller = module.get<ExpendsController>(ExpendsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
