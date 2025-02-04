import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Post } from './posts.model';
import { PostsController, ExternalPostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [SequelizeModule.forFeature([Post])],
  controllers: [PostsController, ExternalPostsController],
  providers: [PostsService],
})
export class PostsModule {}
