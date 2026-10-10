/** Vong xoay khi dang doc/ghi file. `block` = chiem ca khung noi dung. */
export default function Spinner({ block = false, label = 'Đang tải…' }) {
  const spinner = <span className="spinner" role="status" aria-label={label} />;
  return block ? <div className="spinner-block">{spinner}<span>{label}</span></div> : spinner;
}
