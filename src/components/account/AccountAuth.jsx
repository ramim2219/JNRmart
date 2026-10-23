import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';

/** UI-only authentication screens: no credentials are submitted or stored. */
export default function AccountAuth({ mode = 'sign-in' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const isRegister = mode === 'register';
  const isReset = mode === 'forgot-password';
  const title = isReset ? 'Reset your password' : isRegister ? 'Create an account' : 'Welcome back';

  const submit = event => {
    event.preventDefault();
    setMessage('This is a frontend preview. Authentication and email delivery will be enabled after Laravel API integration.');
  };

  return <div className="jnr-account-auth-page">
    <div className="container">
      <Link className="jnr-account-back" to="/account"><ArrowLeft size={16}/> Account dashboard preview</Link>
      <div className="jnr-account-auth-grid">
        <div className="jnr-account-auth-intro">
          <span className="jnr-account-auth-emblem"><UserRound size={28}/></span>
          <p className="jnr-account-hero-eyebrow">JNRMART ACCOUNT</p>
          <h1>Shopping feels better when everything is in one place.</h1>
          <p>Keep your favourite products, orders and delivery addresses easy to find.</p>
          <div className="jnr-account-auth-benefit"><ShieldCheck size={19}/> Secure account features are coming with Laravel authentication.</div>
        </div>
        <section className="jnr-account-auth-card" aria-labelledby="jnr-auth-title">
          <h2 id="jnr-auth-title">{title}</h2>
          <p>{isReset ? 'Enter your email address to preview the reset form.' : isRegister ? 'Join JNRmart to enjoy a personalised shopping experience.' : 'Enter your details to preview the sign-in experience.'}</p>
          <div className="jnr-account-auth-note">UI preview only — please do not enter a real password.</div>
          <form onSubmit={submit} className="jnr-account-auth-form">
            {isRegister && <label className="jnr-account-field">Full name<input type="text" placeholder="Your full name" autoComplete="name" maxLength={100} required/></label>}
            <label className="jnr-account-field">Email address<input type="email" placeholder="you@example.com" autoComplete="email" required/></label>
            {!isReset && <label className="jnr-account-field">Password
              <span className="jnr-account-password-input">
                <input type={showPassword ? 'text' : 'password'} placeholder="Demo password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={6} required/>
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </span>
            </label>}
            {!isRegister && !isReset && <div className="jnr-account-auth-extra"><label><input type="checkbox"/> Remember me</label><Link to="/account/forgot-password">Forgot password?</Link></div>}
            {message && <p className="jnr-account-local-notice" role="status">{message}</p>}
            <button type="submit" className="jnr-account-primary jnr-account-auth-submit">{isReset ? 'Preview password reset' : isRegister ? 'Preview registration' : 'Preview sign in'} <ArrowRight size={17}/></button>
          </form>
          <div className="jnr-account-auth-bottom">
            {isReset ? <Link to="/account/sign-in">Back to sign in</Link> : isRegister ? <>Already have an account? <Link to="/account/sign-in">Sign in</Link></> : <>New to JNRmart? <Link to="/account/register">Create account</Link></>}
          </div>
        </section>
      </div>
    </div>
  </div>;
}
