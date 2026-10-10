import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

/** Thong bao nho (Snackbar) goc duoi man hinh: success / error / info. */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((type, message) => {
    const id = ++idRef.current;
    setItems((list) => [...list.slice(-3), { id, type, message }]);
    setTimeout(() => remove(id), type === 'error' ? 5000 : 3200);
  }, [remove]);

  const api = useMemo(() => ({
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
            <button type="button" aria-label="Đóng thông báo" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
