import { Test, TestingModule } from '@nestjs/testing';
import { OwnerOrderController } from './owner-order.controller';

describe('OwnerOrderController', () => {
  let controller: OwnerOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnerOrderController],
    }).compile();

    controller = module.get<OwnerOrderController>(OwnerOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
