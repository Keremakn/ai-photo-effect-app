import { useState } from 'react';
import { Images, LogIn } from 'lucide-react';
import { getApiErrorMessage } from '../api/apiClient.js';
import { loginAdmin } from '../api/authApi.js';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await loginAdmin({
        email: email.trim(),
        password,
      });
      onLogin(user);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark">
            <Images size={22} strokeWidth={2.1} />
          </div>
          <div>
            <strong>AI Photo Effects</strong>
            <span>Admin</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="feedback error">{error}</div>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <LogIn size={18} strokeWidth={2.1} />
            {isSubmitting ? 'Giris yapiliyor' : 'Giris Yap'}
          </button>
        </form>
      </section>
    </main>
  );
}
