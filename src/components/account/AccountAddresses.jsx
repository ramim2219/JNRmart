import { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { blankAddress } from '../../data/accountDemoData';

const FIELDS = ['label', 'recipient', 'phone', 'street', 'area', 'city', 'region', 'postalCode'];

export default function AccountAddresses({
  addresses = [],
  saveAddress,
  deleteAddress,
  makeDefault,
}) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [notice, setNotice] = useState('');
  const firstField = useRef(null);
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  const previousOverflow = useRef('');

  const openEditor = (address = blankAddress) => {
    setConfirmId(null);
    setEditing({ ...address });
  };

  useEffect(() => {
    if (!editing) return undefined;

    previousFocus.current = document.activeElement;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstField.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditing(null);
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
      );
      const focusable = [...(nodes || [])].filter(
        (node) => node.getClientRects().length > 0
      );
      if (!focusable.length) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow.current;
      if (
        previousFocus.current instanceof HTMLElement &&
        previousFocus.current.isConnected
      ) previousFocus.current.focus();
    };
  }, [editing]);

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      FIELDS.map((field) => [field, String(data.get(field) || '').trim()])
    );

    if (!values.recipient || !values.phone || !values.street || !values.city) return;

    saveAddress({
      ...editing,
      ...values,
      isDefault: data.get('isDefault') === 'on',
    });
    setEditing(null);
    setNotice('Address saved in this browser preview.');
  };

  const removeAddress = (id) => {
    deleteAddress(id);
    setConfirmId(null);
    setNotice('Address removed from this browser preview.');
  };

  return (
    <div className="jnr-account-stack">
      <section className="jnr-account-panel">
        <div className="jnr-account-panel-heading">
          <div>
            <h2>Saved addresses</h2>
            <p>Manage the delivery addresses you use for your orders.</p>
          </div>
          <button type="button" className="jnr-account-primary" onClick={() => openEditor()}>
            <Plus size={17} aria-hidden="true" /> Add address
          </button>
        </div>

        {notice && <p className="jnr-account-local-notice" role="status">{notice}</p>}

        {addresses.length ? (
          <div className="jnr-account-address-grid">
            {addresses.map((address) => (
              <article key={address.id} className="jnr-account-address-card">
                <div className="jnr-account-address-card-header">
                  <strong><MapPin size={17} aria-hidden="true" />{address.label || 'Address'}</strong>
                  {address.isDefault && <span className="jnr-account-default-pill">Default</span>}
                </div>
                <h3>{address.recipient}</h3>
                <p>
                  {[address.street, address.area, address.city, address.region, address.postalCode]
                    .filter(Boolean).join(', ')}
                </p>
                <small>{address.phone}</small>

                <div className="jnr-account-address-actions">
                  <button type="button" onClick={() => openEditor(address)}>
                    <Pencil size={15} aria-hidden="true" /> Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        makeDefault(address.id);
                        setNotice('Default delivery address updated.');
                      }}
                    >
                      <Star size={15} aria-hidden="true" /> Set default
                    </button>
                  )}
                  {confirmId === address.id ? (
                    <span className="jnr-account-confirm-remove" role="group" aria-label="Confirm address removal">
                      Remove?
                      <button type="button" className="is-danger" onClick={() => removeAddress(address.id)}>Yes</button>
                      <button type="button" onClick={() => setConfirmId(null)}>No</button>
                    </span>
                  ) : (
                    <button type="button" className="is-danger" onClick={() => setConfirmId(address.id)}>
                      <Trash2 size={15} aria-hidden="true" /> Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="jnr-account-empty">
            <MapPin size={36} aria-hidden="true" />
            <h3>No saved addresses yet</h3>
            <p>Add a delivery address to make your future checkout experience easier.</p>
            <button type="button" className="jnr-account-secondary" onClick={() => openEditor()}>
              <Plus size={16} aria-hidden="true" /> Add your first address
            </button>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="jnr-account-modal-scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <section
            ref={modalRef}
            className="jnr-account-address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jnr-address-modal-title"
            aria-describedby="jnr-address-modal-description"
            tabIndex={-1}
          >
            <div className="jnr-account-modal-header">
              <div>
                <h2 id="jnr-address-modal-title">{editing.id ? 'Edit address' : 'Add new address'}</h2>
                <p id="jnr-address-modal-description">Enter the recipient and delivery details below.</p>
              </div>
              <button type="button" aria-label="Close address form" onClick={() => setEditing(null)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submit} className="jnr-account-address-form">
              <div className="jnr-account-form-grid">
                <label className="jnr-account-field">
                  Address label
                  <select name="label" defaultValue={editing.label || 'Home'}>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="jnr-account-field">
                  Recipient name
                  <input ref={firstField} name="recipient" defaultValue={editing.recipient || ''}
                    placeholder="Full name" autoComplete="name" maxLength={90} required />
                </label>
                <label className="jnr-account-field">
                  Phone number
                  <input name="phone" type="tel" defaultValue={editing.phone || ''}
                    placeholder="01XXXXXXXXX" autoComplete="tel" maxLength={22} required />
                </label>
                <label className="jnr-account-field jnr-account-full">
                  Street address
                  <input name="street" defaultValue={editing.street || ''}
                    placeholder="House, road or street" autoComplete="street-address"
                    maxLength={180} required />
                </label>
                <label className="jnr-account-field">
                  Area
                  <input name="area" defaultValue={editing.area || ''}
                    placeholder="Area / landmark" maxLength={110} />
                </label>
                <label className="jnr-account-field">
                  City
                  <input name="city" defaultValue={editing.city || ''}
                    placeholder="e.g. Chattogram" autoComplete="address-level2"
                    maxLength={80} required />
                </label>
                <label className="jnr-account-field">
                  District
                  <input name="region" defaultValue={editing.region || ''}
                    placeholder="District" autoComplete="address-level1" maxLength={80} />
                </label>
                <label className="jnr-account-field">
                  Postal code
                  <input name="postalCode" defaultValue={editing.postalCode || ''}
                    placeholder="Postal code" autoComplete="postal-code" maxLength={20} />
                </label>
              </div>

              <label className="jnr-account-switch-line">
                <input type="checkbox" name="isDefault" defaultChecked={Boolean(editing.isDefault)} />
                <span>Make this my default delivery address</span>
              </label>

              <div className="jnr-account-modal-actions">
                <button type="button" className="jnr-account-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="jnr-account-primary">Save address</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
