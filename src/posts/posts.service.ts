import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';

import { Post } from './posts.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private postRepository: typeof Post,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async fetchAndSaveExternalPosts(): Promise<Post[]> {
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');

    const createdPosts = await this.postRepository.bulkCreate(data);
    return createdPosts;
  }
}
