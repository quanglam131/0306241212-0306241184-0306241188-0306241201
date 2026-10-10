import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

const fmt = (iso) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** Form them/sua: bat buoc co tieu de (TC-03), noi dung khong bat buoc. */
function NoteForm({ note, onSave, onCancel, saving, variant }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    onSave({ title: title.trim(), content });
  };

  return (
    <Modal
      title={note ? 'Sửa ghi chú' : 'Ghi chú mới'}
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="btn" onClick={onCancel}>Hủy</button>
          <button type="submit" form="note-form" className="btn btn-primary" disabled={saving}>
            {saving && <Spinner />} {note ? 'Lưu thay đổi' : 'Thêm ghi chú'}
          </button>
        </>
      )}
    >
      <form id="note-form" onSubmit={submit} noValidate>
        <label className="field">
          <span>Tiêu đề</span>
          <input
            autoFocus value={title} maxLength={150}
            placeholder={variant === 'private' ? 'Ví dụ: Tài khoản ngân hàng' : 'Ví dụ: Lịch họp dự án'}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
          />
        </label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <label className="field">
          <span>Nội dung</span>
          <textarea rows={8} maxLength={10000} value={content} onChange={(e) => setContent(e.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

/**
 * Component DUNG CHUNG cho ghi chu thuong va ghi chu rieng tu.
 * Chi khac nhau o cac ham truyen vao: loadNotes(query), onCreate, onUpdate(note, data), onDelete(note).
 * loadNotes phai duoc boc useCallback o noi goi (doi ham = tai lai danh sach).
 */
export default function NoteManager({
  title, subtitle, loadNotes, onCreate, onUpdate, onDelete,
  showTopic = false, variant = 'public', actions, emptyText,
}) {
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState(null); // { type: 'create' | 'edit' | 'view' | 'delete', note? }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    loadNotes(debounced)
      .then((data) => { if (!cancelled) setNotes(data); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadNotes, debounced, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const run = async (task, successMessage) => {
    setSaving(true);
    try {
      await task();
      toast.success(successMessage);
      setDialog(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const save = (data) => run(
    () => (dialog.type === 'edit' ? onUpdate(dialog.note, data) : onCreate(data)),
    dialog.type === 'edit' ? 'Đã lưu thay đổi' : 'Đã thêm ghi chú'
  );

  return (
    <section className={`notes notes-${variant}`}>
      <header className="page-head">
        <div>
          <h1>{title} {loading && notes.length > 0 && <Spinner />}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <div className="head-actions">
          {actions}
          <button type="button" className="btn btn-primary" onClick={() => setDialog({ type: 'create' })}>
            <Icon name="plus" /> Thêm ghi chú
          </button>
        </div>
      </header>

      <div className="searchbar">
        <Icon name="search" />
        <input
          type="search" value={query} placeholder="Tìm theo tiêu đề hoặc nội dung…"
          aria-label="Tìm kiếm ghi chú" onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && notes.length === 0 && <Spinner block label="Đang đọc dữ liệu…" />}

      {loadError && (
        <div className="notice notice-error" role="alert">
          {loadError} <button type="button" className="link-btn" onClick={reload}>Thử lại</button>
        </div>
      )}

      {!loading && !loadError && notes.length === 0 && (
        <div className="empty">
          {debounced
            ? <p>Không có ghi chú nào khớp “{debounced}”.</p>
            : <p>{emptyText || 'Chưa có ghi chú nào. Bấm “Thêm ghi chú” để bắt đầu.'}</p>}
        </div>
      )}

      <div className="note-grid">
        {notes.map((n) => (
          <article key={n.id} className="note-card">
            <button type="button" className="note-open" onClick={() => setDialog({ type: 'view', note: n })}>
              <h3 className="note-title">{n.title}</h3>
              {showTopic && n.topicName && <span className="chip">{n.topicName}</span>}
              <p className="note-snippet">{n.content || 'Chưa có nội dung'}</p>
            </button>
            <footer className="note-foot">
              <time dateTime={n.updatedAt}>Cập nhật {fmt(n.updatedAt)}</time>
              <div className="row-actions">
                <button type="button" className="icon-btn" title="Xem" aria-label={`Xem ${n.title}`} onClick={() => setDialog({ type: 'view', note: n })}><Icon name="eye" /></button>
                <button type="button" className="icon-btn" title="Sửa" aria-label={`Sửa ${n.title}`} onClick={() => setDialog({ type: 'edit', note: n })}><Icon name="edit" /></button>
                <button type="button" className="icon-btn danger" title="Xóa" aria-label={`Xóa ${n.title}`} onClick={() => setDialog({ type: 'delete', note: n })}><Icon name="trash" /></button>
              </div>
            </footer>
          </article>
        ))}
      </div>

      {(dialog?.type === 'create' || dialog?.type === 'edit') && (
        <NoteForm note={dialog.note} variant={variant} saving={saving} onSave={save} onCancel={() => setDialog(null)} />
      )}

      {dialog?.type === 'view' && (
        <Modal
          title={dialog.note.title}
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="btn" onClick={() => setDialog({ type: 'edit', note: dialog.note })}><Icon name="edit" /> Sửa</button>
              <button type="button" className="btn btn-primary" onClick={() => setDialog(null)}>Đóng</button>
            </>
          )}
        >
          {showTopic && dialog.note.topicName && <span className="chip">{dialog.note.topicName}</span>}
          <p className="note-full">{dialog.note.content || 'Chưa có nội dung'}</p>
          <dl className="meta">
            <div><dt>Tạo lúc</dt><dd>{fmt(dialog.note.createdAt)}</dd></div>
            <div><dt>Cập nhật lúc</dt><dd>{fmt(dialog.note.updatedAt)}</dd></div>
          </dl>
        </Modal>
      )}

      {dialog?.type === 'delete' && (
        <Modal
          title="Xóa ghi chú?"
          size="sm"
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="btn" onClick={() => setDialog(null)}>Giữ lại</button>
              <button
                type="button" className="btn btn-danger" disabled={saving}
                onClick={() => run(() => onDelete(dialog.note), 'Đã xóa ghi chú')}
              >
                {saving && <Spinner />} Xóa ghi chú
              </button>
            </>
          )}
        >
          <p>Ghi chú “{dialog.note.title}” sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
        </Modal>
      )}
    </section>
  );
}
