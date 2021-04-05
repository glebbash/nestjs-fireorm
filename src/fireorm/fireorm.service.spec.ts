import { FireormService } from './fireorm.service';
import { Firestore } from '@google-cloud/firestore';
import firebase from 'firebase-admin';
import { BaseFirestoreRepository, Collection } from 'fireorm';

describe('firestore service', () => {
  afterEach(() => jest.resetAllMocks());

  const projectId = 'stub';
  const firestore = new Firestore({
    projectId,
    credential: firebase.credential.applicationDefault(),
  });
  const fireormService = new FireormService(firestore, {
    fireormSettings: { validateModels: true },
  });

  describe('onModuleDestroy', () => {
    it('calls terminate method on fs client', async () => {
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
