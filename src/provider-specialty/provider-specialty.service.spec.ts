import { Test, TestingModule } from '@nestjs/testing';
import { ProviderSpecialtyService } from './provider-specialty.service';

describe('ProviderSpecialtyService', () => {
  let service: ProviderSpecialtyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderSpecialtyService],
    }).compile();

    service = module.get<ProviderSpecialtyService>(ProviderSpecialtyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
