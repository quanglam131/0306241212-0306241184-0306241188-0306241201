import { Navigate, Route, Routes, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import NotesPage from './pages/NotesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PrivatePage from './pages/PrivatePage.jsx';

function NotFound() {
  return (
    <div className="empty">
      <h2>Không tìm thấy trang</h2>
      <p>Đường dẫn này không tồn tại.</p>
      <Link className="btn btn-primary" to="/notes">Về ghi chú</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/notes" replace />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/:slug" element={<NotesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="private" element={<PrivatePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
