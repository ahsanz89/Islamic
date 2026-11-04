import { navigate } from '../router';

// The artifact host reloads the page on '#' links, so links navigate in memory instead.
export default function Link({ href, children, onClick, prefetch, ...rest }) {
  const go = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a
      role="link"
      tabIndex={0}
      style={{ cursor: 'pointer', ...(rest.style || {}) }}
      {...rest}
      onClick={go}
      onKeyDown={(e) => { if (e.key === 'Enter') go(e); }}
    >
      {children}
    </a>
  );
}
