// src/pages/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const { success: toastSuccess } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const result = await register(username.trim(), email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      toastSuccess('Registration successful! Welcome aboard 🎉');
      onNavigate('home');
    } else {
      setErrorMessage(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} className="text-accent" />
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join AURA Store to start ordering and manage your cart</p>
        </div>

        {errorMessage && (
          <div className="form-error-alert" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="field-label" htmlFor="reg-username">
              Username
            </label>
            <div className="field-input-wrap">
              <User size={18} className="field-icon" />
              <input
                id="reg-username"
                type="text"
                className="form-input field-input"
                placeholder="tejas_chavan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="reg-email">
              Email Address
            </label>
            <div className="field-input-wrap">
              <Mail size={18} className="field-icon" />
              <input
                id="reg-email"
                type="email"
                className="form-input field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="reg-password">
              Password
            </label>
            <div className="field-input-wrap">
              <Lock size={18} className="field-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input field-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="btn-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="field-hint">Must contain at least 6 characters</span>
          </div>

          <button
            type="submit"
            className="btn-primary btn-large w-full mt-4"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('login')}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
