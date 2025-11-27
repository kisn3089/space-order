import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('OwnerService', () => {
  let service: OwnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
