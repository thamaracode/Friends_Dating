import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { initSocialSchema } from './social/schema';
import { PostsService } from './social/postsService';

describe('Feature: Content-First Social Discovery & Creator Ecosystem', () => {
  beforeAll(() => {
    initSocialSchema();
    PostsService.seedDefaultPosts();
  });

  describe('1. Content-First Feed & Topic Filtering', () => {
    it('returns public expressions in For You feed mode with author details', () => {
      const feed = PostsService.getFeed({
        feed_mode: 'for_you',
        limit: 15
      }, 'usr_viewer_1');

      expect(feed.items.length).toBeGreaterThan(0);
      const first = feed.items[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('author_name');
      expect(first).toHaveProperty('post_type');
      expect(first).toHaveProperty('content');
    });

    it('filters feed by content type (e.g. quote, poll, thought)', () => {
      const feed = PostsService.getFeed({
        post_type: 'poll',
        limit: 10
      }, 'usr_viewer_1');

      expect(feed.items.length).toBeGreaterThanOrEqual(1);
      for (const item of feed.items) {
        expect(item.post_type).toBe('poll');
      }
    });

    it('returns trending posts ranked by engagement', () => {
      const feed = PostsService.getFeed({
        feed_mode: 'trending',
        limit: 10
      }, 'usr_tara');

      expect(feed.items.length).toBeGreaterThan(0);
    });

    it('filters feed by category / stream', () => {
      const feed = PostsService.getFeed({
        category: 'cinema',
        limit: 10
      }, 'usr_tara');

      expect(feed.items.length).toBeGreaterThanOrEqual(1);
      const hasCinema = feed.items.some(p => p.tags.includes('#cinema') || p.content.toLowerCase().includes('cinema'));
      expect(hasCinema).toBe(true);
    });
  });

  describe('2. Creator Discovery & Following Protocol', () => {
    it('retrieves creator profile dossier with public post counts and follow status', () => {
      const creator = PostsService.getCreatorProfile('usr_elena', 'usr_me');

      expect(creator).not.toBeNull();
      expect(creator?.name).toBe('Elena Rostova');
      expect(creator?.posts_count).toBeGreaterThanOrEqual(1);
      expect(typeof creator?.is_following).toBe('boolean');
    });

    it('toggles follow status and reflects in creator followers count', () => {
      // 1. Follow Elena
      const followRes = PostsService.toggleFollow('usr_me', 'usr_elena');
      expect(followRes.is_following).toBe(true);
      expect(followRes.followers_count).toBeGreaterThanOrEqual(1);

      // 2. Verify Following feed includes Elena's posts
      const followingFeed = PostsService.getFeed({
        feed_mode: 'following',
        limit: 20
      }, 'usr_me');

      const authorIds = followingFeed.items.map(p => p.user_id);
      expect(authorIds).toContain('usr_elena');

      // 3. Unfollow Elena
      const unfollowRes = PostsService.toggleFollow('usr_me', 'usr_elena');
      expect(unfollowRes.is_following).toBe(false);
    });

    it('retrieves public posts authored by a specific creator', () => {
      const result = PostsService.getCreatorPosts('usr_elena', undefined, 10, 'usr_me');

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      for (const item of result.items) {
        expect(item.user_id).toBe('usr_elena');
      }
    });
  });

  describe('3. User Feed Preferences & Personalization', () => {
    it('saves and retrieves preferred discovery topics', () => {
      const updatedTopics = ['philosophy', 'cinema', 'ceramics'];

      PostsService.updateUserPreferences('usr_me', updatedTopics, 'for_you');

      const prefs = PostsService.getUserPreferences('usr_me');
      expect(prefs.preferred_categories).toEqual(updatedTopics);
      expect(prefs.preferred_feed_mode).toBe('for_you');
    });
  });

  describe('4. Post Creation & Safety Controls', () => {
    it('allows publishing a thought post with hashtags and persists in feed', () => {
      const post = PostsService.createPost({
        user_id: 'usr_me',
        post_type: 'thought',
        title: 'Automated Discovery Verification',
        content: 'A contemplation on authentic content-first connections over visual ranking. #philosophy #authenticity',
        visibility: 'public'
      });

      expect(post).toBeDefined();
      expect(post.title).toBe('Automated Discovery Verification');
      expect(post.tags).toContain('#philosophy');
      expect(post.tags).toContain('#authenticity');
    });

    it('allows hiding a post so it is excluded from future feeds', () => {
      // Hide post_elena_01 for usr_alex
      PostsService.hidePost('usr_alex', 'post_elena_01');

      // Verify excluded in getFeed
      const feed = PostsService.getFeed({
        feed_mode: 'for_you',
        limit: 50
      }, 'usr_alex');

      const postIds = feed.items.map(p => p.id);
      expect(postIds).not.toContain('post_elena_01');
    });
  });
});
