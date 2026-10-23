import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'jnrmart:account-ui-preview:v1';
const INITIAL = {
  profile: { name: 'Demo Customer', email: '', phone: '', birthDate: '', gender: '' },
  addresses: [],
  preferences: { orderUpdates: true, offers: false, newsletter: false },
};

function readDemo() {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (!value || typeof value !== 'object') return INITIAL;
    return {
      profile: { ...INITIAL.profile, ...(value.profile || {}) },
      addresses: Array.isArray(value.addresses) ? value.addresses.slice(0, 30) : [],
      preferences: { ...INITIAL.preferences, ...(value.preferences || {}) },
    };
  } catch {
    return INITIAL;
  }
}

/** UI-only state persisted in this browser; never an authenticated customer account. */
export function useAccountDemo() {
  const [data, setData] = useState(readDemo);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch { /* Storage can be disabled without breaking the UI. */ }
  }, [data]);

  const saveProfile = useCallback(profile => {
    setData(previous => ({ ...previous, profile: { ...previous.profile, ...profile } }));
  }, []);

  const saveAddress = useCallback(address => {
    setData(previous => {
      const entry = { ...address, id: address.id || `address-${Date.now()}` };
      const existing = previous.addresses.some(item => item.id === entry.id);
      let addresses = existing
        ? previous.addresses.map(item => item.id === entry.id ? entry : item)
        : [...previous.addresses, entry];
      const defaultId = entry.isDefault || addresses.length === 1 ? entry.id : (addresses.find(item => item.isDefault)?.id || addresses[0]?.id);
      addresses = addresses.map(item => ({ ...item, isDefault: item.id === defaultId }));
      return { ...previous, addresses };
    });
  }, []);

  const deleteAddress = useCallback(id => setData(previous => {
    const addresses = previous.addresses.filter(address => address.id !== id);
    if (addresses.length && !addresses.some(item => item.isDefault)) addresses[0] = { ...addresses[0], isDefault: true };
    return { ...previous, addresses };
  }), []);

  const makeDefault = useCallback(id => setData(previous => ({
    ...previous, addresses: previous.addresses.map(item => ({ ...item, isDefault: item.id === id })),
  })), []);

  const savePreferences = useCallback(preferences => {
    setData(previous => ({ ...previous, preferences: { ...previous.preferences, ...preferences } }));
  }, []);

  return { ...data, saveProfile, saveAddress, deleteAddress, makeDefault, savePreferences };
}
