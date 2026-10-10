import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { useToast } from './ToastContext.jsx';

/**
 * State toan cuc (Context API): ten hien thi, theme, mau chu dao, danh sach chu de.
 * Doi theme/mau se ap dung NGAY (realtime) qua CSS variables; bam "Luu" moi ghi xuong profile.json.
 */
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const DEFAULTS = { displayName: '', theme: 'light', primaryColor: '#4f46e5' };

/** Chon chu trang/den cho nen mau chu dao de luon doc duoc. */
function contrastOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#111827' : '#ffffff';
}

const fromProfile = (p) => ({
  displayName: p.displayName,
  theme: p.preferences.theme,
  primaryColor: p.preferences.primaryColor,
});

export function AppProvider({ children }) {
  const toast = useToast();
  const [settings, setSettings] = useState(DEFAULTS); // gia tri dang hien thi (co the chua luu)
  const [saved, setSaved] = useState(DEFAULTS); // gia tri da ghi xuong file
  const savedRef = useRef(saved);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [topics, setTopics] = useState([]);
  const [topicDialog, setTopicDialog] = useState(null); // { mode: 'create' | 'rename', topic? }

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [profile, topicList] = await Promise.all([api.getProfile(), api.listTopics()]);
      const s = fromProfile(profile);
      savedRef.current = s;
      setSettings(s);
      setSaved(s);
      setTopics(topicList);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      toast.error(err.message);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Ap theme + mau len <html>; CSS doc cac bien --primary, data-theme.
  useEffect(() => {
    const root = document.documentElement;
    const onPrimary = contrastOn(settings.primaryColor);
    root.dataset.theme = settings.theme;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--on-primary', onPrimary);
    try {
      localStorage.setItem('ui-cache', JSON.stringify({ theme: settings.theme, primaryColor: settings.primaryColor, onPrimary }));
    } catch { /* bo qua neu trinh duyet chan localStorage */ }
  }, [settings.theme, settings.primaryColor]);

  const previewSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const revertSettings = useCallback(() => setSettings(savedRef.current), []);

  const saveSettings = useCallback(async () => {
    try {
      const res = await api.updateProfile({
        displayName: settings.displayName,
        preferences: { theme: settings.theme, primaryColor: settings.primaryColor },
      });
      const s = fromProfile(res.profile);
      savedRef.current = s;
      setSaved(s);
      setSettings(s);
      toast.success('Đã lưu cài đặt');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [settings, toast]);

  const refreshTopics = useCallback(async () => {
    const list = await api.listTopics();
    setTopics(list);
    return list;
  }, []);

  const dirty = settings.displayName !== saved.displayName
    || settings.theme !== saved.theme
    || settings.primaryColor !== saved.primaryColor;

  const value = useMemo(() => ({
    settings, dirty, status, topics, topicDialog,
    previewSettings, revertSettings, saveSettings, reload: load, refreshTopics,
    openTopicDialog: setTopicDialog,
    closeTopicDialog: () => setTopicDialog(null),
  }), [settings, dirty, status, topics, topicDialog, previewSettings, revertSettings, saveSettings, load, refreshTopics]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
