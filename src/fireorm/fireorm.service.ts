import { Firestore } from '@google-cloud/firestore';
import { Inject, Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { BaseFirestoreRepository, getRepository, IEntity, initialize } from 'fireorm';

import { FireormSettings } from './fireorm.module';

@Injectable()
export class FireormService implements OnModuleDestroy {
  constructor(
    @Inject(Firestore) public readonly firestore: Firestore,
    @Inject(FireormSettings)
    { fireormSettings }: Pick<FireormSettings, 'fireormSettings'>,
  ) {
    initialize(firestore, fireormSettings);
  }

  getRepository<T extends IEntity>(entity: Type<T>): BaseFirestoreRepository<T> {
    return getRepository(entity);
  }

  async onModuleDestroy(): Promise<void> {
    await this.firestore.terminate();
  }
}
