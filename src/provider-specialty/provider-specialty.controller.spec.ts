import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSpecialtyController } from './provider-specialty.controller';

describe('ProviderSpecialtyController', () => {
  let controller: ProviderSpecialtyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderSpecialtyController],
    }).compile();

    controller = module.get<ProviderSpecialtyController>(ProviderSpecialtyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
