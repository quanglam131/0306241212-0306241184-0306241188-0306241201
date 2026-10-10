import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import Spinner from './Spinner.jsx';
import TopicDialog from './TopicDialog.jsx';
import { useApp } from '../context/AppContext.jsx';

/** Khung chung: Sidebar (dieu huong + danh sach chu de) va vung Content. Tren mobile sidebar truot ra tu trai. */
export default function Layout() {
  const { settings, topics, status, reload, topicDialog, openTopicDialog } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (status === 'loading') return <div className="boot"><Spinner block label="Đang tải dữ liệu…" /></div>;
  if (status === 'error') {
    return (
      <div className="boot">
        <div className="empty">
          <h2>Không tải được dữ liệu</h2>
          <p>Hãy chắc chắn Backend đang chạy ở cổng 5000, rồi thử lại.</p>
          <button type="button" className="btn btn-primary" onClick={reload}>Thử lại</button>
        </div>
      </div>
    );
  }

  const name = settings.displayName.trim() || 'bạn';

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="Mở menu" onClick={() => setOpen(true)}>
          <Icon name="menu" size={22} />
        </button>
        <strong>Sổ ghi chú</strong>
      </header>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Điều hướng">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <strong>Sổ ghi chú</strong>
            <small>Xin chào, {name}</small>
          </div>
        </div>

        <nav>
          <div className="nav-group">
            <div className="nav-title">
              <span><Icon name="notes" /> Ghi chú</span>
              <button
                type="button" className="icon-btn" aria-label="Thêm chủ đề" title="Thêm chủ đề"
                onClick={() => openTopicDialog({ mode: 'create' })}
              >
                <Icon name="plus" />
              </button>
            </div>
            <ul className="topic-list">
              {topics.length === 0 && <li className="muted small">Chưa có chủ đề nào</li>}
              {topics.map((t) => (
                <li key={t.slug}>
                  <NavLink to={`/notes/${t.slug}`} className="nav-link">
                    <span className="truncate">{t.name}</span>
                    <span className="count">{t.noteCount}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <NavLink to="/private" className="nav-link nav-main"><Icon name="lock" /> Vùng riêng tư</NavLink>
          <NavLink to="/settings" className="nav-link nav-main"><Icon name="settings" /> Cài đặt</NavLink>
        </nav>
      </aside>

      <main className="content"><Outlet /></main>
      {topicDialog && <TopicDialog key={`${topicDialog.mode}-${topicDialog.topic?.slug || 'new'}`} />}
    </div>
  );
}
