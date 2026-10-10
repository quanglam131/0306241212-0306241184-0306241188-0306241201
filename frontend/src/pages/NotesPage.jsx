import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import NoteManager from '../components/NoteManager.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Ghi chu thuong theo chu de: /notes/:slug. Dang tim kiem thi tim tren moi chu de. */
export default function NotesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { topics, refreshTopics, openTopicDialog } = useApp();
  const topic = topics.find((t) => t.slug === slug);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  // Vao /notes khong kem chu de -> chuyen toi chu de dau tien.
  useEffect(() => {
    if (!slug && topics.length > 0) navigate(`/notes/${topics[0].slug}`, { replace: true });
  }, [slug, topics, navigate]);

  const loadNotes = useCallback((q) => (q ? api.searchNotes(q) : api.listNotes(slug)), [slug]);
  const onCreate = useCallback(async (data) => { await api.createNote(slug, data); await refreshTopics(); }, [slug, refreshTopics]);
  const onUpdate = useCallback((note, data) => api.updateNote(note.topic || slug, note.id, data), [slug]);
  const onDelete = useCallback(async (note) => { await api.deleteNote(note.topic || slug, note.id); await refreshTopics(); }, [slug, refreshTopics]);

  const removeTopic = async () => {
    setBusy(true);
    try {
      await api.deleteTopic(slug);
      const list = await refreshTopics();
      toast.success('Đã xóa chủ đề');
      setConfirmDelete(false);
      navigate(list.length ? `/notes/${list[0].slug}` : '/notes', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (topics.length === 0) {
    return (
      <div className="empty">
        <h2>Bắt đầu với một chủ đề</h2>
        <p>Chủ đề giúp bạn nhóm ghi chú theo học tập, công việc, ý tưởng…</p>
        <button type="button" className="btn btn-primary" onClick={() => openTopicDialog({ mode: 'create' })}>
          <Icon name="plus" /> Tạo chủ đề đầu tiên
        </button>
      </div>
    );
  }

  if (slug && !topic) {
    return (
      <div className="empty">
        <h2>Chủ đề không tồn tại</h2>
        <p>Chủ đề này có thể đã bị xóa.</p>
        <Link className="btn btn-primary" to="/notes">Về danh sách ghi chú</Link>
      </div>
    );
  }

  if (!topic) return <Spinner block />;

  return (
    <>
      <NoteManager
        key={slug}
        title={topic.name}
        subtitle={`${topic.noteCount} ghi chú · gõ từ khóa để tìm trong tất cả chủ đề`}
        loadNotes={loadNotes}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        showTopic
        actions={(
          <>
            <button type="button" className="btn" onClick={() => openTopicDialog({ mode: 'rename', topic })}>
              <Icon name="edit" /> Đổi tên
            </button>
            <button type="button" className="btn btn-ghost-danger" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" /> Xóa chủ đề
            </button>
          </>
        )}
      />
      {confirmDelete && (
        <Modal
          title="Xóa chủ đề?"
          size="sm"
          onClose={() => setConfirmDelete(false)}
          footer={(
            <>
              <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Giữ lại</button>
              <button type="button" className="btn btn-danger" disabled={busy} onClick={removeTopic}>
                {busy && <Spinner />} Xóa chủ đề
              </button>
            </>
          )}
        >
          <p>
            Chủ đề “{topic.name}” và {topic.noteCount} ghi chú bên trong sẽ bị xóa vĩnh viễn.
          </p>
        </Modal>
      )}
    </>
  );
}
