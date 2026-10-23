import { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { blankAddress } from '../../data/accountDemoData';

export default function AccountAddresses({ addresses, saveAddress, deleteAddress, makeDefault }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [notice, setNotice] = useState('');
  const firstField = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!editing) return undefined;
    previousFocus.current = document.activeElement;
    firstField.current?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') setEditing(null);
      if (event.key !== 'Tab') return;
      const focusable = [...document.querySelectorAll('.jnr-account-address-modal button:not([disabled]), .jnr-account-address-modal input:not([disabled]), .jnr-account-address-modal select:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previousFocus.current?.focus?.();
    };
  }, [editing]);

  const submit = event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newEntry = Object.fromEntries(['label', 'recipient', 'phone', 'street', 'area', 'city', 'region', 'postalCode']
      .map(field => [field, String(form.get(field) || '').trim()]));
    if (!newEntry.recipient || !newEntry.phone || !newEntry.street || !newEntry.city) return;
    saveAddress({ ...editing, ...newEntry, isDefault: form.get('isDefault') === 'on' });
    setEditing(null);
    setNotice('Saved in this browser only — not synced to a customer account.');
  };

  return <div className="jnr-account-stack">
    <section className="jnr-account-panel">
      <div className="jnr-account-panel-heading">
        <div><h2>Saved addresses</h2><p>Add delivery addresses for your future orders.</p></div>
        <button type="button" className="jnr-account-primary" onClick={() => setEditing({ ...blankAddress })}><Plus size={17}/> Add address</button>
      </div>
      {notice && <p className="jnr-account-local-notice" role="status">{notice}</p>}
      {addresses.length ? <div className="jnr-account-address-grid">
        {addresses.map(address => <article key={address.id} className="jnr-account-address-card">
          <div className="jnr-account-address-card-header"><strong><MapPin size={17}/>{address.label}</strong>{address.isDefault && <span>Default</span>}</div>
          <h3>{address.recipient}</h3>
          <p>{[address.street, address.area, address.city, address.region, address.postalCode].filter(Boolean).join(', ')}</p>
          <small>{address.phone}</small>
          <div className="jnr-account-address-actions">
            <button type="button" onClick={() => setEditing({ ...address })}><Pencil size={15}/> Edit</button>
            {!address.isDefault && <button type="button" onClick={() => { makeDefault(address.id); setNotice('Default address updated locally.'); }}><Star size={15}/> Set default</button>}
            {confirmId !== address.id ? (
              <button type="button" className="is-danger" onClick={() => setConfirmId(address.id)}><Trash2 size={15}/> Remove</button>
            ) : <span className="jnr-account-confirm-remove">Remove? <button type="button" className="is-danger" onClick={() => { deleteAddress(address.id); setConfirmId(null); }}>Yes</button><button type="button" onClick={() => setConfirmId(null)}>No</button></span>}
          </div>
        </article>)}
      </div> : <div className="jnr-account-empty"><MapPin size={36}/><h3>No saved addresses yet</h3><p>Your saved addresses will appear here.</p><button type="button" className="jnr-account-secondary" onClick={() => setEditing({ ...blankAddress })}>Add your first address</button></div>}
    </section>

    {editing && <div className="jnr-account-modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) setEditing(null); }}>
      <section className="jnr-account-address-modal" role="dialog" aria-modal="true" aria-labelledby="jnr-address-modal-title">
        <div className="jnr-account-modal-header"><div><h2 id="jnr-address-modal-title">{editing.id ? 'Edit address' : 'Add new address'}</h2><p>Stored locally for this UI preview.</p></div><button type="button" aria-label="Close" onClick={() => setEditing(null)}><X size={21}/></button></div>
        <form onSubmit={submit} className="jnr-account-address-form">
          <div className="jnr-account-form-grid">
            <label className="jnr-account-field">Label<select name="label" defaultValue={editing.label}><option>Home</option><option>Office</option><option>Other</option></select></label>
            <label className="jnr-account-field">Recipient name <input ref={firstField} name="recipient" defaultValue={editing.recipient} placeholder="Full name" maxLength={90} required/></label>
            <label className="jnr-account-field">Phone number <input name="phone" type="tel" defaultValue={editing.phone} placeholder="01XXXXXXXXX" maxLength={22} required/></label>
            <label className="jnr-account-field jnr-account-full">Street address <input name="street" defaultValue={editing.street} placeholder="House, road or street" maxLength={180} required/></label>
            <label className="jnr-account-field">Area <input name="area" defaultValue={editing.area} placeholder="Area / landmark" maxLength={110}/></label>
            <label className="jnr-account-field">City <input name="city" defaultValue={editing.city} placeholder="e.g. Chattogram" maxLength={80} required/></label>
            <label className="jnr-account-field">District <input name="region" defaultValue={editing.region} placeholder="District" maxLength={80}/></label>
            <label className="jnr-account-field">Postal code <input name="postalCode" defaultValue={editing.postalCode} placeholder="Postal code" maxLength={20}/></label>
          </div>
          <label className="jnr-account-switch-line"><input type="checkbox" name="isDefault" defaultChecked={editing.isDefault}/> Make this my default address</label>
          <div className="jnr-account-modal-actions"><button type="button" className="jnr-account-secondary" onClick={() => setEditing(null)}>Cancel</button><button type="submit" className="jnr-account-primary">Save address</button></div>
        </form>
      </section>
    </div>}
  </div>;
}
