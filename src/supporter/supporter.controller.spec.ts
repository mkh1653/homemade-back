import { Test, TestingModule } from '@nestjs/testing';
import { SupporterController } from './supporter.controller';
import { SupporterService } from './supporter.service';

describe('SupporterController', () => {
  let controller: SupporterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupporterController],
      providers: [SupporterService],
    }).compile();

    controller = module.get<SupporterController>(SupporterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
