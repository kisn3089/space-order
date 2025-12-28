import { Test, TestingModule } from '@nestjs/testing';
import { TableSessionController } from './tableSession.controller';

describe('TableSessionController', () => {
  let controller: TableSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableSessionController],
    }).compile();

    controller = module.get<TableSessionController>(TableSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
