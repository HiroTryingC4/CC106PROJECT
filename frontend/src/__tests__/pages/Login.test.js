import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/auth/Login';
import { AuthProvider } from '../../contexts/AuthContext';

global.fetch = jest.fn();

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValueOnce({ ok: false });
  });

  it('should render login form', async () => {
    render(<MockedLogin />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(<MockedLogin />);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInvalid();
    });
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        user: { id: 1, email: 'test@example.com', role: 'guest' },
        token: 'test-token'
      })
    };

    fetch.mockResolvedValueOnce({ ok: false });
    fetch.mockResolvedValueOnce(mockResponse);

    render(<MockedLogin />);
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );
    });
  });
});
