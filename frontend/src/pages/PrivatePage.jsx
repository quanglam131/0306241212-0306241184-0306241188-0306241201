import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import NoteManager from '../components/NoteManager.jsx';
import Spinner from '../components/Spinner.jsx';
import { api, getPrivateToken, onUnauthorized, setPrivateToken } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const MIN_LEN = 4;

/**
 * Vung rieng tu. Moi lan vao trang (mount) deu o trang thai KHOA:
 *  setup  -> lan dau, bat buoc dat mat khau
 *  locked -> popup nhap mat khau (khong dong duoc, khong thay du lieu phia sau)
 *  unlocked -> hien ghi chu (token chi o bo nho: F5 hoac roi tab la khoa lai)
 */
export default function PrivatePage() {
  const toast = useToast();
  const [state, setState] = useState('loading'); // loading | error | setup | locked | unlocked
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const { hasPassword } = await api.privateStatus();
      setState(hasPassword ? 'locked' : 'setup');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    check();
    // Roi khoi tab -> huy phien o server va xoa token.
    return () => {
      if (getPrivateToken()) {
        api.lockPrivate().catch(() => {});
        setPrivateToken(null);
      }
    };
  }, [check]);

  // Server bao het phien (401) -> khoa lai.
  useEffect(() => onUnauthorized(() => {
    setPrivateToken(null);
    setPw('');
    setState('locked');
    toast.info('Phiên đã hết hạn, vui lòng nhập lại mật khẩu');
  }), [toast]);

  const unlock = async (e) => {
    e.preventDefault();
    if (!pw) { setError('Vui lòng nhập mật khẩu'); return; }
    setBusy(true);
    setError('');
    try {
      const { token } = await api.authPrivate(pw);
      setPrivateToken(token);
      setPw('');
      setState('unlocked');
    } catch (err) {
      setError(err.message);
      setPw('');
    } finally {
      setBusy(false);
    }
  };

  const setup = async (e) => {
    e.preventDefault();
    if (pw.length < MIN_LEN) { setError(`Mật khẩu tối thiểu ${MIN_LEN} ký tự`); return; }
    if (pw !== pw2) { setError('Hai mật khẩu chưa khớp'); return; }
    setBusy(true);
    setError('');
    try {
      const { token } = await api.setupPrivate(pw);
      setPrivateToken(token);
      setPw('');
      setPw2('');
      setState('unlocked');
      toast.success('Đã thiết lập mật khẩu vùng riêng tư');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const lockNow = async () => {
    try { await api.lockPrivate(); } catch { /* bo qua: phien co the da het han */ }
    setPrivateToken(null);
    setState('locked');
  };

  const loadNotes = useCallback(async (q) => {
    const all = await api.listPrivateNotes();
    if (!q) return all;
    const s = q.toLowerCase();
    return all.filter((n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
  }, []);
  const onCreate = useCallback((data) => api.createPrivateNote(data), []);
  const onUpdate = useCallback((note, data) => api.updatePrivateNote(note.id, data), []);
  const onDelete = useCallback((note) => api.deletePrivateNote(note.id), []);

  if (state === 'unlocked') {
    return (
      <NoteManager
        variant="private"
        title="Vùng riêng tư"
        subtitle="Nội dung được mã hóa trong file private.json. Rời khỏi trang này sẽ tự khóa lại."
        loadNotes={loadNotes}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        emptyText="Chưa có ghi chú riêng tư. Bấm “Thêm ghi chú” để lưu thông tin nhạy cảm."
        actions={<button type="button" className="btn" onClick={lockNow}><Icon name="lock" /> Khóa ngay</button>}
      />
    );
  }

  return (
    <>
      <div className="locked-backdrop">
        <Icon name="lock" size={40} />
        <p>Vùng riêng tư đang khóa</p>
      </div>

      {state === 'loading' && <Spinner block />}

      {state === 'error' && (
        <div className="empty">
          <h2>Không kiểm tra được trạng thái</h2>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={check}>Thử lại</button>
        </div>
      )}

      {state === 'locked' && (
        <Modal
          title="Nhập mật khẩu để mở khóa"
          dismissible={false}
          size="sm"
          footer={(
            <>
              <Link className="btn" to="/notes">Về ghi chú</Link>
              <button type="submit" form="unlock-form" className="btn btn-primary" disabled={busy}>
                {busy && <Spinner />} Mở khóa
              </button>
            </>
          )}
        >
          <form id="unlock-form" onSubmit={unlock} noValidate>
            <label className="field">
              <span>Mật khẩu</span>
              <input
                type="password" autoFocus autoComplete="current-password" value={pw}
                onChange={(e) => { setPw(e.target.value); setError(''); }}
              />
            </label>
            {error && <p className="field-error" role="alert">{error}</p>}
            <p className="muted small">Quên mật khẩu? Dữ liệu được mã hóa nên không thể khôi phục.</p>
          </form>
        </Modal>
      )}

      {state === 'setup' && (
        <Modal
          title="Thiết lập mật khẩu vùng riêng tư"
          dismissible={false}
          size="sm"
          footer={(
            <>
              <Link className="btn" to="/notes">Để sau</Link>
              <button type="submit" form="setup-form" className="btn btn-primary" disabled={busy}>
                {busy && <Spinner />} Đặt mật khẩu
              </button>
            </>
          )}
        >
          <form id="setup-form" onSubmit={setup} noValidate>
            <p className="muted">Lần đầu vào đây, hãy đặt mật khẩu bảo vệ. Bạn sẽ cần nhập lại mỗi lần mở.</p>
            <label className="field">
              <span>Mật khẩu mới</span>
              <input type="password" autoFocus autoComplete="new-password" value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} />
            </label>
            <label className="field">
              <span>Nhập lại mật khẩu</span>
              <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => { setPw2(e.target.value); setError(''); }} />
            </label>
            {error && <p className="field-error" role="alert">{error}</p>}
          </form>
        </Modal>
      )}
    </>
  );
}
