import { Module } from '@nestjs/common';
import { FireormModule } from '../../../src/nestjs-fireorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [FireormModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
