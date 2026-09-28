import { ApiError } from '@common/ApiError';
import { usersRepository } from './users.repository';

export const usersService = {
  async getCurrentUser(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
      profile: user.profile,
    };
  },
};
