import { expect } from 'chai';

import User from '../../src/models/user.model';
import Post from '../../src/models/post.model';
import PostService from '../../src/services/post.service';

const postService = new PostService();

describe('Post service', () => {
  describe('Get posts', () => {
    it('should return an array of posts', async () => {
      const user = new User({
        username: 'test',
        email: 'test@test.com',
        password: 'password',
      });
      await user.save();

      for (let i = 0; i < 5; i++) {
        const post = new Post({ description: `Post ${i}`, user: user._id });
        await post.save();
      }

      const posts = await postService.getPosts({ skip: 1, limit: 2 });

      expect(posts.length).to.be.equal(2);
      expect(posts[0]).to.deep.include({
        description: 'Post 1',
      });
      expect(posts[1]).to.deep.include({
        description: 'Post 2',
      });
      expect(posts[0].user.toHexString()).to.be.equal(user._id.toHexString());
    });
  });

  describe('Get post by id', () => {
    it('should return a post for the passed id', async () => {
      const post = new Post({
        description: 'Post',
        user: '5e29e867d1e46ae137e5fdf9',
      });
      await post.save();

      const result = await postService.getPostById(post._id);

      expect(result.user.toHexString()).to.be.equal('5e29e867d1e46ae137e5fdf9');
      expect(result.description).to.be.equal('Post');
    });

    it('should throw post not found error', async () => {
      try {
        await postService.getPostById('5e29e867d1e46ae137e5fdf9');
      } catch (error) {
        expect(error.status).to.be.equal(404);
        expect(error.message).to.be.equal('Post not found');
      }
    });
  });

  describe('Create post', () => {
    it('should create the post passing the right data', async () => {
      const result = await postService.createPost('5e29e867d1e46ae137e5fdf9', {
        description: 'Post',
      });

      expect(result.user.toHexString()).to.be.equal('5e29e867d1e46ae137e5fdf9');
      expect(result.description).to.be.equal('Post');
    });
  });

  describe('Update post', () => {
    it('should update the post successfully', async () => {
      const post = new Post({
        description: 'Post',
        user: '5e29e867d1e46ae137e5fdf9',
      });
      await post.save();

      const result = await postService.updatePost(
        '5e29e867d1e46ae137e5fdf9',
        post._id,
        {
          description: 'Modified',
        },
      );
      if (!result) throw new Error();

      expect(result.description).to.be.equal('Modified');
      expect(result._id.toHexString()).to.be.equal(post._id.toHexString());
    });

    it('should not find and throw post not found exception', async () => {
      try {
        await postService.updatePost(
          '5e29e867d1e46ae137e5fdf9',
          '5e29e867d1e46ae137e5fdf0',
          {
            description: 'Modified',
          },
        );
      } catch (error) {
        expect(error.status).to.be.equal(404);
        expect(error.message).to.be.equal('Post not found');
      }
    });
  });

  describe('Delete post', () => {
    it('should delete the post successfully', async () => {
      const post = new Post({
        description: 'Post',
        user: '5e29e867d1e46ae137e5fdf9',
      });
      await post.save();

      const result = await postService.deletePost(
        '5e29e867d1e46ae137e5fdf9',
        post._id,
      );
      expect(result).to.be.true;
    });

    it('should not find the post and return false', async () => {
      try {
        await postService.deletePost(
          '5e29e867d1e46ae137e5fdf9',
          '5e29e867d1e46ae137e5fdf9',
        );
      } catch (error) {
        expect(error.status).to.be.equal(404);
        expect(error.message).to.be.equal('Post not found');
      }
    });
  });
});
