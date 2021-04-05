import { Module } from '@nestjs/common';
import { credential } from 'firebase-admin';
import { FireormModule } from '../../src/nestjs-fireorm';

@Module({
  imports: [
    FireormModule.forRoot({
      firestoreSettings: {
        projectId: '<project_id>',
        credential: credential.applicationDefault(),
      },
      fireormSettings: { validateModels: true },
    }),
  ],
})
export class AppModule {}
