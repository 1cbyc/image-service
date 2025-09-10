import mongoose from 'mongoose';
import User from '../src/models/User';

describe('User Model', () => {
  describe('User Registration', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData1 = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'user2',
        email: 'duplicate@example.com', // Same email
        password: 'password456'
      };

      await new User(userData1).save();

      await expect(new User(userData2).save()).rejects.toThrow();
    });

    it('should reject duplicate username', async () => {
      const userData1 = {
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'duplicateuser', // Same username
        email: 'user2@example.com',
        password: 'password456'
      };

      await new User(userData1).save();

      await expect(new User(userData2).save()).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    let user: any;

    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
    });

    it('should return true for correct password', async () => {
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });
});
