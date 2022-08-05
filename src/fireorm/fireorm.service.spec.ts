import { Firestore } from '@google-cloud/firestore';
import { BaseFirestoreRepository, Collection } from 'fireorm';

import { FireormService } from './fireorm.service';

describe('FireormService', () => {
  afterEach(() => jest.restoreAllMocks());

  const projectId = 'stub';
  const firestore = new Firestore({
    projectId,
  });
  const fireormService = new FireormService(firestore, {
    fireormSettings: { validateModels: true },
  });

  describe('onModuleDestroy', () => {
    it('calls terminate method on firestore client', async () => {
      const terminateSpy = jest.spyOn(firestore, 'terminate').mockResolvedValue();

      await fireormService.onModuleDestroy();
      expect(terminateSpy).toBeCalled();
    });
  });

  describe('getRepository', () => {
    it('returns repository', async () => {
      @Collection()
      class Entity {
        id!: string;
      }

      const repo = fireormService.getRepository(Entity);
      expect(repo).toBeInstanceOf(BaseFirestoreRepository);
    });

    it('fails if entity is not a collection', () => {
      class Entity {
        id!: string;
      }

      expect(() => fireormService.getRepository(Entity)).toThrow();
    });
  });
});
