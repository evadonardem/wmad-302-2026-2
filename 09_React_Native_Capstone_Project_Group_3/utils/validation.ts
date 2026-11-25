/**
 * Form validation helpers
 */

export interface RegisterForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: 'male' | 'female';
}

/** Returns the first validation problem, or null when the form is valid. */
export function validateRegisterForm(form: RegisterForm, agreedToTerms: boolean): string | null {
  if (!form.firstName.trim()) return 'First name is required';
  if (!form.lastName.trim()) return 'Last name is required';
  if (!form.username.trim()) return 'Username is required';
  if (form.username.trim().length < 3) return 'Username must be at least 3 characters';
  if (!/^[A-Za-z0-9_.]+$/.test(form.username.trim())) {
    return 'Username can only contain letters, numbers, dots and underscores';
  }
  if (!form.email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Invalid email format';
  if (!form.password) return 'Password is required';
  if (form.password.length < 6) return 'Password must be at least 6 characters';
  if (form.password !== form.confirmPassword) return 'Passwords do not match';
  if (form.age.trim()) {
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 13 || age > 120) return 'Age must be between 13 and 120';
  }
  if (!agreedToTerms) return 'You must agree to the Terms of Service';
  return null;
}

/** Returns the first validation problem for the profile form, or null when valid. */
export function validateProfileForm(form: {
  firstName: string;
  lastName: string;
  email: string;
}): string | null {
  if (!form.firstName.trim()) return 'First name is required';
  if (!form.lastName.trim()) return 'Last name is required';
  if (!form.email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Invalid email format';
  return null;
}
