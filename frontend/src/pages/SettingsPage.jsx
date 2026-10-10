import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner.jsx';
import { api, setPrivateToken } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const PRESETS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ff5722', '#db2777'];
const MIN_LEN = 4;

/** Doi / dat mat khau vung rieng tu. Doi mat khau bat buoc nhap mat khau cu. */
function PrivatePasswordForm() {
  const toast = useToast();
  const [hasPw, setHasPw] = useState(null);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.privateStatus().then((s) => setHasPw(s.hasPassword)).catch((e) => setError(e.message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (hasPw && !oldPw) { setError('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (newPw.length < MIN_LEN) { setError(`Mật khẩu mới tối thiểu ${MIN_LEN} ký tự`); return; }
    if (newPw !== confirm) { setError('Hai mật khẩu mới chưa khớp'); return; }
    setBusy(true);
    setError('');
    try {
      if (hasPw) {
        await api.changePrivatePassword(oldPw, newPw);
        setPrivateToken(null); // moi phien cu da bi huy o server
        toast.success('Đã đổi mật khẩu vùng riêng tư');
      } else {
        await api.setupPrivate(newPw);
        setHasPw(true);
        toast.success('Đã thiết lập mật khẩu vùng riêng tư');
      }
      setOldPw(''); setNewPw(''); setConfirm('');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (hasPw === null) return error ? <p className="field-error">{error}</p> : <Spinner block />;

  return (
    <form className="card form-stack" onSubmit={submit} noValidate>
      <h2>Mật khẩu vùng riêng tư</h2>
      <p className="muted">
        {hasPw
          ? 'Đổi mật khẩu sẽ mã hóa lại toàn bộ ghi chú riêng tư bằng mật khẩu mới.'
          : 'Bạn chưa đặt mật khẩu. Đặt ngay để bắt đầu lưu thông tin riêng tư.'}
      </p>
      {hasPw && (
        <label className="field">
          <span>Mật khẩu hiện tại</span>
          <input type="password" autoComplete="current-password" value={oldPw} onChange={(e) => { setOldPw(e.target.value); setError(''); }} />
        </label>
      )}
      <label className="field">
        <span>Mật khẩu mới</span>
        <input type="password" autoComplete="new-password" value={newPw} onChange={(e) => { setNewPw(e.target.value); setError(''); }} />
      </label>
      <label className="field">
        <span>Nhập lại mật khẩu mới</span>
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} />
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy && <Spinner />} {hasPw ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}
        </button>
      </div>
    </form>
  );
}

/** Cai dat hien thi: ten, theme, mau chu dao. Thay doi ap dung ngay; bam Luu de ghi xuong profile.json. */
export default function SettingsPage() {
  const { settings, dirty, previewSettings, revertSettings, saveSettings } = useApp();
  const [saving, setSaving] = useState(false);

  // Roi trang ma chua luu -> tra giao dien ve gia tri da luu.
  useEffect(() => () => revertSettings(), [revertSettings]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveSettings();
    setSaving(false);
  };

  return (
    <section className="settings">
      <header className="page-head">
        <div>
          <h1>Cài đặt</h1>
          <p className="muted">Giao diện thay đổi ngay khi bạn chọn. Bấm “Lưu thay đổi” để giữ lại cho lần sau.</p>
        </div>
      </header>

      <form className="card form-stack" onSubmit={save} noValidate>
        <h2>Hiển thị</h2>

        <label className="field">
          <span>Tên hiển thị</span>
          <input
            value={settings.displayName} maxLength={50} placeholder="Bạn muốn được gọi là gì?"
            onChange={(e) => previewSettings({ displayName: e.target.value })}
          />
        </label>

        <fieldset className="field">
          <legend>Giao diện</legend>
          <div className="segmented" role="radiogroup" aria-label="Giao diện">
            {[['light', 'Sáng'], ['dark', 'Tối']].map(([value, label]) => (
              <label key={value} className={settings.theme === value ? 'is-active' : ''}>
                <input
                  type="radio" name="theme" value={value} checked={settings.theme === value}
                  onChange={() => previewSettings({ theme: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Màu chủ đạo</legend>
          <div className="swatches">
            {PRESETS.map((c) => (
              <button
                key={c} type="button" className={`swatch ${settings.primaryColor === c ? 'is-active' : ''}`}
                style={{ background: c }} aria-label={`Chọn màu ${c}`} aria-pressed={settings.primaryColor === c}
                onClick={() => previewSettings({ primaryColor: c })}
              />
            ))}
            <label className="color-pick">
              <input type="color" value={settings.primaryColor} onChange={(e) => previewSettings({ primaryColor: e.target.value })} />
              <span>{settings.primaryColor}</span>
            </label>
          </div>
        </fieldset>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
            {saving && <Spinner />} Lưu thay đổi
          </button>
          <button type="button" className="btn" disabled={!dirty || saving} onClick={revertSettings}>Hoàn tác</button>
          {dirty && <span className="muted small">Có thay đổi chưa lưu</span>}
        </div>
      </form>

      <PrivatePasswordForm />
    </section>
  );
}
