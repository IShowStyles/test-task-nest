import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { PostsService } from './posts.service';
import { Post } from './posts.model';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllPosts(): Promise<Post[]> {
    return this.postsService.getAllPosts();
  }
}

@Controller('external')
export class ExternalPostsController {
  constructor(private postsService: PostsService) {}

  @Get('posts')
  async fetchAndSaveExternalPosts(): Promise<Post[]> {
    return this.postsService.fetchAndSaveExternalPosts();
  }
}
