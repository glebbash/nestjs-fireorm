import { Firestore } from '@google-cloud/firestore';
import {
  ClassProvider,
  DynamicModule,
  ExistingProvider,
  FactoryProvider,
  Module,
  Type,
  ValueProvider,
} from '@nestjs/common';
import type { MetadataStorageConfig } from 'fireorm/lib/src/MetadataStorage';

import { FireormService } from './fireorm.service';
import { getRepositoryToken } from './utils/repository-token';

export const FireormSettings = Symbol('FireormSettings');
export type FireormSettings =
  | {
      firestore: Firestore;
      firestoreSettings?: undefined;
      fireormSettings?: MetadataStorageConfig;
    }
  | {
      firestore?: undefined;
      firestoreSettings?: FirebaseFirestore.Settings;
      fireormSettings?: MetadataStorageConfig;
    };

export type AsyncProvider<T> =
  | Omit<ClassProvider<T>, 'provide'>
  | Omit<ValueProvider<T>, 'provide'>
  | Omit<FactoryProvider<T>, 'provide'>
  | Omit<ExistingProvider<T>, 'provide'>;

export type FireormModuleAsyncOptions = AsyncProvider<FireormSettings | undefined>;

@Module({})
export class FireormModule {
  /**
   * Example:
   * ```
   * Module({
   *   imports: [
   *     FireormModule.forRoot({
   *       firestoreSettings: {
   *         projectId: '<project_id>',
   *         credential: credential.applicationDefault(),
   *       },
   *       fireormSettings: { validateModels: true },
   *     ),
   *     UsersModule,
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(settings?: FireormSettings): DynamicModule {
    return FireormModule.forRootAsync({ useValue: settings });
  }

  /**
   * Example:
   * ```
   * Module({
   *   imports: [
   *     FireormModule.forRootAsync({
   *       inject: [ConfigService],
   *       useFactory: (config: ConfigService) => ({
   *         firestoreSettings: {
   *           projectId: config.projectId,
   *           credential: credential.applicationDefault(),
   *         },
   *         fireormSettings: { validateModels: true },
   *       }),
   *     ),
   *     UsersModule,
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRootAsync(options: FireormModuleAsyncOptions): DynamicModule {
    return {
      module: FireormModule,
      global: true,
      providers: [
        {
          provide: FireormSettings,
          ...options,
        },
        {
          provide: Firestore,
          inject: [FireormSettings],
          useFactory: firestoreProvider,
        },
        {
          provide: FireormService,
          inject: [Firestore, FireormSettings],
          useFactory: (firestore: Firestore, settings: FireormSettings) =>
            new FireormService(firestore, settings),
        },
      ],
      exports: [FireormService],
    };
  }

  /**
   * Example:
   * ```
   * Module({
   *   imports: [FireormModule.forFeature([User])],
   *   providers: [UsersService],
   *   exports: [UsersService],
   * })
   * export class UsersModule {}
   * ```
   */
  static forFeature(entities: Type[]): DynamicModule {
    const providers = entities.map((e) => ({
      provide: getRepositoryToken(e),
      inject: [FireormService],
      useFactory: (fs: FireormService) => fs.getRepository(e),
    }));

    return {
      module: FireormModule,
      providers: providers,
      exports: providers,
    };
  }
}

export const firestoreProvider = (settings: FireormSettings): Firestore =>
  settings.firestore ?? new Firestore(settings.firestoreSettings);
