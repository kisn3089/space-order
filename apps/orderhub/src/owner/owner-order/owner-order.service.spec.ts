import { Test, TestingModule } from '@nestjs/testing';
import { OwnerOrderService } from './owner-order.service';

describe('OwnerOrderService', () => {
  let service: OwnerOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnerOrderService],
    }).compile();

    service = module.get<OwnerOrderService>(OwnerOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
