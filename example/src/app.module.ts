import { Module } from '@nestjs/common';
import { FireormModule } from 'nestjs-fireorm';

@Module({
  imports: [
    FireormModule.forRoot({
      firestoreSettings: {
        projectId: '<project_id>',
      },
      fireormSettings: { validateModels: true },
    }),
  ],
})
export class AppModule {}
