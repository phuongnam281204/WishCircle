import { FormEvent, ReactElement, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestOtp, setToken, setupProfile, verifyOtp } from '../api';
import { User } from '../types';

/** Phone-first registration screen for new WishCircle members. */
export function RegisterView(): ReactElement {
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string>('');
  const [code, setCode] = useState<string>('123456');
  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>('Start with your phone number. Dev OTP is 123456.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const submitOtpRequest = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await runAction(async () => {
      await requestOtp(phone);
      setMessage('OTP sent. Use 123456 while developing.');
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
      setMessage('Phone verified. Finish your profile to continue.');
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
          <p className="auth-copy">Start your journey of staying close to the people you love.</p>
        </div>
        <p className="status-message info">{message}</p>
        {!user ? (
          <>
            <form className="form-stack" onSubmit={submitOtpRequest}>
              <label className="field">
                <span>Phone number</span>
                <span className="input-shell">
                  <span className="material-symbols-outlined">call</span>
                  <input className="text-input" onChange={(event) => setPhone(event.target.value)} placeholder="Enter your phone number" type="tel" value={phone} />
                </span>
              </label>
              <button className="gradient-button" disabled={isLoading || !phone} type="submit">Send OTP</button>
            </form>
            <form className="form-stack" onSubmit={submitOtpVerification}>
              <label className="field">
                <span>OTP code</span>
                <span className="input-shell">
                  <span className="material-symbols-outlined">password</span>
                  <input className="text-input" maxLength={6} onChange={(event) => setCode(event.target.value)} value={code} />
                </span>
              </label>
              <button className="secondary-button" disabled={isLoading || !phone || !code} type="submit">Verify phone</button>
            </form>
          </>
        ) : (
          <form className="form-stack" onSubmit={submitProfile}>
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
            <button className="gradient-button" disabled={isLoading || !name || !birthday} type="submit">Create account</button>
          </form>
        )}
        <p className="auth-copy">
          Already have an account? <Link className="link-button" to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
