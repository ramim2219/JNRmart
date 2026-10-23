import { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';

export default function AccountProfile({ profile, saveProfile, preferences, savePreferences, isSettings }) {
  const [form, setForm] = useState(profile);
  const [notice, setNotice] = useState('');
  useEffect(() => setForm(profile), [profile]);

  const submit = event => {
    event.preventDefault();
    saveProfile({
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      birthDate: form.birthDate, gender: form.gender,
    });
    setNotice('Profile changes saved locally for preview. No account was updated on a server.');
  };

  if (isSettings) return <div className="jnr-account-stack">
    <section className="jnr-account-panel">
      <div className="jnr-account-panel-heading"><div><h2>Communication preferences</h2><p>Choose which updates you would like to receive.</p></div></div>
      {[
        ['orderUpdates', 'Order status updates', 'Get updates as your order progresses.'],
        ['offers', 'Special deals & promotions', 'Be the first to see featured offers.'],
        ['newsletter', 'Weekly newsletter', 'Get product news and shopping inspiration.'],
      ].map(([key, label, description]) => <label className="jnr-account-preference" key={key}>
        <span><strong>{label}</strong><small>{description}</small></span>
        <input type="checkbox" checked={Boolean(preferences[key])} onChange={e => savePreferences({ [key]: e.target.checked })} />
      </label>)}
      <p className="jnr-account-local-notice">These switches are UI preferences only; no messages are sent yet.</p>
    </section>
    <section className="jnr-account-panel">
      <div className="jnr-account-panel-heading"><div><h2>Security</h2><p>Password, active sessions and account security.</p></div></div>
      <div className="jnr-account-security"><span><LockKeyhole size={24}/></span><div><strong>Secure account access</strong><p>Real password changes and device management will be available when Laravel authentication is connected.</p></div><ShieldCheck size={22}/></div>
    </section>
  </div>;

  return <section className="jnr-account-panel">
    <div className="jnr-account-panel-heading"><div><h2>Personal information</h2><p>Edit your basic details for a more personal shopping experience.</p></div></div>
    <form className="jnr-account-profile-form" onSubmit={submit}>
      <div className="jnr-account-form-grid">
        <label className="jnr-account-field jnr-account-full">Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={100} autoComplete="name" /></label>
        <label className="jnr-account-field">Email address<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></label>
        <label className="jnr-account-field">Phone number<input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" autoComplete="tel" /></label>
        <label className="jnr-account-field">Date of birth<input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} max={new Date().toISOString().slice(0,10)}/></label>
        <label className="jnr-account-field">Gender <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
      </div>
      {notice && <p className="jnr-account-local-notice" role="status"><CheckCircle2 size={16}/>{notice}</p>}
      <div className="jnr-account-form-footer"><p>This preview saves information only to your browser.</p><button type="submit" className="jnr-account-primary">Save changes</button></div>
    </form>
  </section>;
}
