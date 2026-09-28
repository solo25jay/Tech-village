import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '@common/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@common/jwt';
import { env } from '@config/env';
import { authRepository } from './auth.repository';
import { createEmailProvider } from '@integrations/email/emailProviderFactory';

const emailProvider = createEmailProvider();

function flattenRolesAndPermissions(user: {
  roles: { role: { name: string; permissions: { permission: { key: string } }[] } }[];
}) {
  const roles = user.roles.map((ur) => ur.role.name);
  const permissions = Array.from(
    new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))),
  );
  return { roles, permissions };
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async register(input: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Fire-and-log verification email; do not block registration on delivery.
    const verificationToken = crypto.randomBytes(24).toString('hex');
    await emailProvider.send({
      to: user.email,
      subject: 'Verify your Tech Village account',
      html: `<p>Hi ${user.firstName}, verify your account using code: ${verificationToken}</p>`,
    });

    return { id: user.id, email: user.email };
  },

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw ApiError.forbidden('This account is not active');
    }

    const { roles, permissions } = flattenRolesAndPermissions(user);
    const accessToken = signAccessToken({ sub: user.id, roles, permissions });
    const refreshToken = signRefreshToken(user.id);

    const expiresAt = new Date(Date.now() + env.jwtRefreshTtlDays * 24 * 60 * 60 * 1000);
    await authRepository.storeRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, roles },
    };
  },

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await authRepository.findUserWithRolesById(payload.sub);
    if (!user) throw ApiError.unauthorized('Invalid refresh token');

    const { roles, permissions } = flattenRolesAndPermissions(user);
    const accessToken = signAccessToken({ sub: user.id, roles, permissions });
    return { accessToken };
  },

  async logout(refreshToken: string) {
    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  },
};
