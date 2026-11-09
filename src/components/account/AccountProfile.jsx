import { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
};

const PREFERENCES = [
  { key: 'orderUpdates', label: 'Order status updates', description: 'Get updates as your order progresses.' },
  { key: 'offers', label: 'Special deals & promotions', description: 'Be the first to see featured offers.' },
  { key: 'newsletter', label: 'Weekly newsletter', description: 'Get product news and shopping inspiration.' },
];

export default function AccountProfile({
  profile = EMPTY_PROFILE,
  saveProfile,
  preferences = {},
  savePreferences,
  isSettings = false,
}) {
  const [form, setForm] = useState(() => ({ ...EMPTY_PROFILE, ...profile }));
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setForm({ ...EMPTY_PROFILE, ...profile });
  }, [profile]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    saveProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
    });
    setNotice('Profile changes saved locally for preview. No server account was updated.');
  };

  if (isSettings) {
    return (
      <div className="jnr-account-stack">
        <section className="jnr-account-panel">
          <div className="jnr-account-panel-heading">
            <div><h2>Communication preferences</h2><p>Choose the updates you would like to receive.</p></div>
          </div>

          {PREFERENCES.map(({ key, label, description }) => (
            <label className="jnr-account-preference" key={key}>
              <span><strong>{label}</strong><small>{description}</small></span>
              <input
                type="checkbox"
                role="switch"
                checked={Boolean(preferences[key])}
                onChange={(event) => savePreferences({ [key]: event.target.checked })}
                aria-label={label}
              />
            </label>
          ))}

          <p className="jnr-account-local-notice">
            These are preview preferences only. No messages are sent yet.
          </p>
        </section>

        <section className="jnr-account-panel">
          <div className="jnr-account-panel-heading">
            <div><h2>Security</h2><p>Password, active sessions and account security.</p></div>
          </div>
          <div className="jnr-account-security">
            <span><LockKeyhole size={24} aria-hidden="true" /></span>
            <div>
              <strong>Secure account access</strong>
              <p>Password changes and device management will be available after Laravel authentication is connected.</p>
            </div>
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="jnr-account-panel">
      <div className="jnr-account-panel-heading">
        <div><h2>Personal information</h2><p>Keep your basic details up to date.</p></div>
      </div>

      <form className="jnr-account-profile-form" onSubmit={submit}>
        <div className="jnr-account-form-grid">
          <label className="jnr-account-field jnr-account-full">
            Full name
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required minLength={2} maxLength={100} autoComplete="name"
            />
          </label>

          <label className="jnr-account-field">
            Email address
            <input
              type="email" value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com" autoComplete="email"
            />
          </label>

          <label className="jnr-account-field">
            Phone number
            <input
              type="tel" value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="01XXXXXXXXX" autoComplete="tel"
            />
          </label>

          <label className="jnr-account-field">
            Date of birth
            <input
              type="date" value={form.birthDate || ''}
              onChange={(event) => updateField('birthDate', event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>

          <label className="jnr-account-field">
            Gender
            <select value={form.gender || ''} onChange={(event) => updateField('gender', event.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        {notice && (
          <p className="jnr-account-local-notice" role="status">
            <CheckCircle2 size={16} aria-hidden="true" /> {notice}
          </p>
        )}

        <div className="jnr-account-form-footer">
          <p>Preview only — changes are saved locally in your browser.</p>
          <button type="submit" className="jnr-account-primary">Save changes</button>
        </div>
      </form>
    </section>
  );
}
