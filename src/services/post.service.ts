import Post, { PostInterface } from '../models/post.model';
import { CreatePostDto, UpdatePostDto } from '../dtos/post';
import { PaginationOptions } from '../interfaces';
import {
  BadRequestException,
  NotFoundException,
  InternalServerError,
  UnauthorizedException,
} from '../exceptions';

export interface PostServiceInterface {
  getPosts(options: PaginationOptions): Promise<PostInterface[]>;
  getPostById(postId: string): Promise<PostInterface>;
  createPost(
    userId: string,
    creaetPostDto: CreatePostDto,
  ): Promise<PostInterface>;
  updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostInterface | null>;
  deletePost(userId: string, postId: string): Promise<boolean>;
}

class PostService implements PostServiceInterface {
  public async getPosts(options: PaginationOptions): Promise<PostInterface[]> {
    return Post.find(
      {},
      {},
      { skip: options.skip, limit: options.limit },
    ).select('_id description user');
  }

  public async getPostById(postId: string): Promise<PostInterface> {
    const post = await Post.findById(postId).select('_id description user');
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  public async createPost(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostInterface> {
    const created = new Post({
      description: createPostDto.description,
      user: userId,
    });
    await created.save();

    const post = await Post.findById(created._id);
    if (!post) {
      throw new InternalServerError();
    }

    return post;
  }

  public async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostInterface | null> {
    let post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.toHexString() !== userId.toString()) {
      throw new UnauthorizedException();
    }

    post = await Post.findByIdAndUpdate(postId, updatePostDto, {
      new: true,
    });

    return post;
  }

  public async deletePost(userId: string, postId: string): Promise<boolean> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.toHexString() !== userId.toString()) {
      throw new UnauthorizedException();
    }

    const result = await Post.findByIdAndDelete(postId);
    if (!result) {
      throw new BadRequestException();
    }

    return !!result;
  }
}

export default PostService;
