import { Test, TestingModule } from '@nestjs/testing';
import { TableSessionService } from './tableSession.service';

describe('TableSessionService', () => {
  let service: TableSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableSessionService],
    }).compile();

    service = module.get<TableSessionService>(TableSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
