import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

/**
 * Hop thoai (Popup). dismissible=false: khong dong bang Esc / bam nen / nut X
 * (dung cho popup nhap mat khau vung rieng tu - bat buoc phai xu ly).
 */
export default function Modal({ title, onClose, children, footer, dismissible = true, size = 'md' }) {
  useEffect(() => {
    if (!dismissible) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismissible, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget && dismissible) onClose?.(); }}
    >
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          {dismissible && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
              <Icon name="x" />
            </button>
          )}
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
