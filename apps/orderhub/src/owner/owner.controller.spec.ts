import { Test, TestingModule } from '@nestjs/testing';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('OwnerController', () => {
  let controller: OwnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnerController],
      providers: [
        OwnerService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OwnerController>(OwnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
