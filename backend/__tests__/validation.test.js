describe('Password Validation', () => {
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const isValid = Object.values(requirements).every(req => req);
    const errors = [];

    if (!requirements.minLength) errors.push('Password must be at least 12 characters long');
    if (!requirements.hasUppercase) errors.push('Password must contain at least one uppercase letter (A-Z)');
    if (!requirements.hasLowercase) errors.push('Password must contain at least one lowercase letter (a-z)');
    if (!requirements.hasNumber) errors.push('Password must contain at least one number (0-9)');
    if (!requirements.hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*)');

    return { isValid, errors, requirements };
  };

  it('should validate a strong password', () => {
    const result = validatePassword('StrongPass123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('weakpass123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter (A-Z)');
  });

  it('should reject password without lowercase', () => {
    const result = validatePassword('WEAKPASS123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter (a-z)');
  });

  it('should reject password without numbers', () => {
    const result = validatePassword('WeakPassword!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number (0-9)');
  });

  it('should reject password without special characters', () => {
    const result = validatePassword('WeakPassword123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
  });

  it('should reject password that is too short', () => {
    const result = validatePassword('Short1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 12 characters long');
  });

  it('should reject password with multiple issues', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
