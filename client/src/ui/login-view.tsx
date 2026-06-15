import { FormEvent, ReactElement, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestOtp, setToken, setupProfile, verifyOtp } from '../api';
import { User } from '../types';

/** Phone OTP login and profile setup screen. */
export function LoginView(): ReactElement {
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('123456');
  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('Use mock OTP 123456 in development.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitOtpRequest = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await runAction(async () => {
      await requestOtp(phone);
      setMessage('OTP sent. Dev code is 123456.');
    });
  };

  const submitOtpVerification = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await runAction(async () => {
      const response = await verifyOtp(phone, code);
      setToken(response.accessToken);
      setUser(response.user);
      setName(response.user.name ?? '');
      setBirthday(response.user.birthday?.slice(0, 10) ?? '');
      if (response.user.name && response.user.birthday) {
        navigate('/dashboard');
      }
    });
  };

  const submitProfile = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await runAction(async () => {
      const response = await setupProfile(name, birthday);
      setToken(response.accessToken);
      navigate('/dashboard');
    });
  };

  const runAction = async (action: () => Promise<void>): Promise<void> => {
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1 className="brand-title brand-gradient">WishCircle</h1>
          <h2>Login</h2>
          <p className="auth-copy">Welcome back! Enter your phone number to continue celebrating together.</p>
        </div>
        <p className="status-message info">{message}</p>
        <form className="form-stack" onSubmit={submitOtpRequest}>
          <label className="field">
            <span>Phone number</span>
            <span className="input-shell">
              <span className="material-symbols-outlined">phone_iphone</span>
              <input className="text-input" onChange={(event) => setPhone(event.target.value)} placeholder="0xxxxxxxxx" type="tel" value={phone} />
            </span>
          </label>
          <button className="gradient-button" disabled={isLoading || !phone} type="submit">
            Send OTP
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
        <form className="form-stack" onSubmit={submitOtpVerification}>
          <label className="field">
            <span>OTP code</span>
            <span className="input-shell">
              <span className="material-symbols-outlined">password</span>
              <input className="text-input" maxLength={6} onChange={(event) => setCode(event.target.value)} value={code} />
            </span>
          </label>
          <button className="secondary-button" disabled={isLoading || !phone || !code} type="submit">Verify OTP</button>
        </form>
        {user ? (
          <form className="form-stack" onSubmit={submitProfile}>
            <h2 className="card-title">Complete profile</h2>
            <label className="field">
              <span>Display name</span>
              <span className="input-shell">
                <span className="material-symbols-outlined">badge</span>
                <input className="text-input" onChange={(event) => setName(event.target.value)} value={name} />
              </span>
            </label>
            <label className="field">
              <span>Birthday</span>
              <span className="input-shell">
                <span className="material-symbols-outlined">cake</span>
                <input className="text-input" onChange={(event) => setBirthday(event.target.value)} type="date" value={birthday} />
              </span>
            </label>
            <button className="gradient-button" disabled={isLoading || !name || !birthday} type="submit">Save profile</button>
          </form>
        ) : null}
        <p className="auth-copy">
          New here? <Link className="link-button" to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
