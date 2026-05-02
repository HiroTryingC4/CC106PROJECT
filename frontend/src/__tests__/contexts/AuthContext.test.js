import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

global.fetch = jest.fn();

const TestComponent = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide auth context to children', async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('should initialize with stored user from localStorage', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'guest' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'guest' };
    
    fetch.mockResolvedValueOnce({
      ok: false
    });

    const LoginComponent = () => {
      const { login, user } = useAuth();
      
      return (
        <div>
          <button onClick={() => login(mockUser, 'test-token', true)}>Login</button>
          <div data-testid="user">{user ? user.email : 'null'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <LoginComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });
});
