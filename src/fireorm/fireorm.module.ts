import { Firestore } from '@google-cloud/firestore';
import { DynamicModule, FactoryProvider, Module, Type } from '@nestjs/common';
import type { MetadataStorageConfig } from 'fireorm/lib/src/MetadataStorage';
import { FireormService } from './fireorm.service';
import { getRepositoryToken } from './utils/repository';

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

type FirestoreModuleAsyncOptions = Pick<
  FactoryProvider<FireormSettings | undefined>,
  'inject' | 'useFactory'
>;

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
    return this.forRootAsync({ inject: [], useFactory: () => settings });
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
  static forRootAsync(options: FirestoreModuleAsyncOptions): DynamicModule {
    return {
      module: FireormModule,
      global: true,
      providers: [
        {
          provide: FireormSettings,
          inject: options.inject,
          useFactory: (...args: unknown[]) => options.useFactory(...args),
        },
        {
          provide: Firestore,
          inject: [FireormSettings],
          useFactory: (settings: FireormSettings) =>
            settings.firestore ?? new Firestore(settings.firestoreSettings),
        },
        {
          provide: FireormService,
          inject: [Firestore, FireormSettings],
          useFactory: (fs: Firestore, settings: FireormSettings) =>
            new FireormService(fs, settings),
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
