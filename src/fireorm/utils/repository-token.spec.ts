jest.mock('@nestjs/common', () => ({
  Inject: jest.fn(),
}));

import { Inject } from '@nestjs/common';

import { getRepositoryToken, InjectRepository } from './repository-token';

describe('repository-token', () => {
  describe('getRepositoryToken', () => {
    class User {}

    it('returns correct token', () => {
      const token = getRepositoryToken(User);

      expect(token).toBe('UserRepository');
    });
  });

  describe('InjectRepository', () => {
    class User {}

    it('returns correct token', () => {
      InjectRepository(User);

      expect(Inject).toBeCalledWith('UserRepository');
    });
  });
});
