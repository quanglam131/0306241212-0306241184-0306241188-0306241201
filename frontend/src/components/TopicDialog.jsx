import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Hop thoai tao moi / doi ten chu de. Duoc mo tu context nen dung o bat ky trang nao. */
export default function TopicDialog() {
  const { topicDialog, closeTopicDialog, refreshTopics } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(topicDialog?.topic?.name || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRename = topicDialog.mode === 'rename';

  const submit = async (e) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) { setError('Vui lòng nhập tên chủ đề'); return; }
    setBusy(true);
    try {
      if (isRename) {
        await api.renameTopic(topicDialog.topic.slug, value);
        toast.success('Đã đổi tên chủ đề');
        await refreshTopics();
      } else {
        const { topic } = await api.createTopic(value);
        toast.success(`Đã tạo chủ đề “${topic.name}”`);
        await refreshTopics();
        navigate(`/notes/${topic.slug}`);
      }
      closeTopicDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isRename ? 'Đổi tên chủ đề' : 'Chủ đề mới'}
      onClose={closeTopicDialog}
      size="sm"
      footer={(
        <>
          <button type="button" className="btn" onClick={closeTopicDialog}>Hủy</button>
          <button type="submit" form="topic-form" className="btn btn-primary" disabled={busy}>
            {busy && <Spinner />} {isRename ? 'Lưu tên mới' : 'Tạo chủ đề'}
          </button>
        </>
      )}
    >
      <form id="topic-form" onSubmit={submit} noValidate>
        <label className="field">
          <span>Tên chủ đề</span>
          <input
            autoFocus value={name} maxLength={40} placeholder="Ví dụ: Du lịch"
            onChange={(e) => { setName(e.target.value); setError(''); }}
          />
        </label>
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
