import { getRepositoryToken } from '../nestjs-fireorm';
import { FireormModule, FireormSettings, firestoreProvider } from './fireorm.module';
jest.mock('./fireorm.service');

import { FireormService } from './fireorm.service';
jest.mock('@google-cloud/firestore');
import { Firestore } from '@google-cloud/firestore';
import { FactoryProvider } from '@nestjs/common';

describe('FireormModule', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('forRoot', () => {
    it('calls forRootAsync with a factory returning provided settings', () => {
      const settings: FireormSettings = {};
      const forRootAsyncSpy = jest
        .spyOn(FireormModule, 'forRootAsync')
        .mockReturnValue({ module: FireormModule });

      FireormModule.forRoot(settings);

      expect(forRootAsyncSpy).toBeCalledWith({
        useValue: settings,
      });
    });
  });

  describe('forRootAsync', () => {
    it('creates global module with fireorm settings, firestore and FirestoreService providers', () => {
      const settings: FireormSettings = {};

      const settingsFactory = () => settings;

      const mod = FireormModule.forRootAsync({ inject: [], useFactory: settingsFactory });

      expect(mod).toEqual({
        module: FireormModule,
        global: true,
        providers: [
          { provide: FireormSettings, inject: [], useFactory: settingsFactory },
          {
            provide: Firestore,
            inject: [FireormSettings],
            useFactory: firestoreProvider,
          },
          {
            provide: FireormService,
            inject: [Firestore, FireormSettings],
            useFactory: expect.any(Function),
          },
        ],
        exports: [FireormService],
      });

      const fireormServiceFactory = (mod as any).providers[2].useFactory;
      const fireormService = fireormServiceFactory(1, 2);

      expect(fireormService).toBeInstanceOf(FireormService);
      expect(FireormService).toBeCalledWith(1, 2);
    });
  });

  describe('forFeature', () => {
    it('creates a module with repository providers for passed entities', () => {
      class A {}
      class B {}
      const entities = [A, B];
      const mod = FireormModule.forFeature(entities);

      expect(mod.module).toBe(FireormModule);
      expect(mod.exports).toBe(mod.providers);

      mod.providers?.forEach((provider, i) => {
        expect(provider).toEqual({
          provide: getRepositoryToken(entities[i]),
          inject: [FireormService],
          useFactory: expect.any(Function),
        });

        const repositoryFactory = (provider as FactoryProvider).useFactory;
        const expectedRepository = 0;
        const fireormServiceMock = {
          getRepository: jest.fn().mockReturnValue(expectedRepository),
        };

        const repository = repositoryFactory(fireormServiceMock);

        expect(repository).toBe(expectedRepository);
        expect(fireormServiceMock.getRepository).toBeCalledWith(entities[i]);
      });
    });
  });

  describe('firestoreProvider', () => {
    it('returns passed firestore instance', () => {
      const firestore = new Firestore();

      const result = firestoreProvider({ firestore });

      expect(result).toBe(firestore);
    });

    it('creates firestore instance based on settings passed', () => {
      const firestoreSettings = { projectId: 'abc' };

      const result = firestoreProvider({ firestoreSettings });

      expect(result).toBeInstanceOf(Firestore);
      expect(Firestore).toBeCalledWith(firestoreSettings);
    });
  });
});
