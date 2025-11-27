import { describe, it, expect } from 'vitest';
import { store } from './store';
import { setCredentials, logout } from './slices/authSlice';

describe('Store', () => {
  it('should initialize with empty auth state', () => {
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });

  it('should set credentials', () => {
    store.dispatch(
      setCredentials({
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          roles: ['admin'],
        },
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      }),
    );
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user?.email).toBe('test@example.com');
  });

  it('should logout', () => {
    store.dispatch(logout());
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });
});

