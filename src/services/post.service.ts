import Post, { PostInterface } from '../models/post.model';
import { CreatePostDto, UpdatePostDto } from '../dtos/post';
import { PaginationOptions } from '../interfaces';
import InternalServerError from '../exceptions/internalServerError.exception';
import NotFoundException from '../exceptions/notFound.exception';

export interface PostServiceInterface {
  getPosts(options: PaginationOptions): Promise<PostInterface[]>;
  getPostById(id: string): Promise<PostInterface>;
  createPost(creaetPostDto: CreatePostDto): Promise<PostInterface>;
  updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostInterface | null>;
  deletePost(id: string): Promise<boolean>;
}

class PostService implements PostServiceInterface {
  public async getPosts(options: PaginationOptions): Promise<PostInterface[]> {
    return Post.find(
      {},
      {},
      { skip: options.skip, limit: options.limit },
    ).select('_id description user');
  }

  public async getPostById(id: string): Promise<PostInterface> {
    const post = await Post.findById(id).select('_id description user');
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  public async createPost(
    createPostDto: CreatePostDto,
  ): Promise<PostInterface> {
    const created = new Post({
      description: createPostDto.description,
      user: createPostDto.user,
    });
    await created.save();

    const post = await Post.findById(created._id);
    if (!post) {
      throw new InternalServerError();
    }

    return post;
  }

  public async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostInterface | null> {
    const post = await Post.findByIdAndUpdate(id, updatePostDto, { new: true });
    return post;
  }

  public async deletePost(id: string): Promise<boolean> {
    const result = await Post.findByIdAndDelete(id);
    return !!result;
  }
}

export default PostService;
