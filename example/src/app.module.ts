import { Module } from '@nestjs/common';
import { FireormModule } from 'nestjs-fireorm';
import { AppController } from './app.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    FireormModule.forRoot({
      firestoreSettings: {
        projectId: '<project_id>',
      },
      fireormSettings: { validateModels: true },
    }),
    FireormModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
