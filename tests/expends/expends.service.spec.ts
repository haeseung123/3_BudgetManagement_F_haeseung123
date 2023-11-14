import { Test, TestingModule } from '@nestjs/testing';
import { ExpendsService } from '../../src/expends/expends.service';

describe('ExpendsService', () => {
	let service: ExpendsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ExpendsService],
		}).compile();

		service = module.get<ExpendsService>(ExpendsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
