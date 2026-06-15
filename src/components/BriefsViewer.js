import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './BriefsViewer.css';

const KEY_HEADER = 'x-practitioner-key';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

export default function BriefsViewer() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [briefs, setBriefs] = useState([]);
  const [activeBrief, setActiveBrief] = useState(null);
  const [content, setContent] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [error, setError] = useState('');

  async function handleUnlock(e) {
    e.preventDefault();
    setLoadingList(true);
    setError('');
    try {
      const res = await fetch('/api/briefs', {
        headers: { [KEY_HEADER]: key },
      });
      if (res.status === 401) throw new Error('Incorrect key');
      if (!res.ok) throw new Error('Failed to load briefs');
      setBriefs(await res.json());
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSelect(brief) {
    if (activeBrief?.filename === brief.filename) return;
    setActiveBrief(brief);
    setContent('');
    setLoadingBrief(true);
    try {
      const res = await fetch(`/api/brief?filename=${encodeURIComponent(brief.filename)}`, {
        headers: { [KEY_HEADER]: key },
      });
      if (!res.ok) throw new Error('Failed to fetch brief');
      setContent(await res.text());
    } catch (err) {
      setContent(`_Error: ${err.message}_`);
    } finally {
      setLoadingBrief(false);
    }
  }

  if (!authed) {
    return (
      <div className="bv-page">
        <div className="bv-unlock-shell">
          <span className="bv-eyebrow">Practitioner Access</span>
          <h1 className="bv-unlock-heading">Session Briefs</h1>
          <form onSubmit={handleUnlock} className="bv-unlock-form">
            <input
              type="password"
              className="bv-key-input"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Practitioner key"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="submit"
              className={`bv-unlock-btn${(!key || loadingList) ? ' bv-unlock-btn--disabled' : ''}`}
              disabled={!key || loadingList}
            >
              {loadingList ? 'Checking…' : 'Unlock'}
            </button>
          </form>
          {error && <p className="bv-error" role="alert">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bv-page bv-page--authed">
      <div className="bv-layout">

        {/* Sidebar */}
        <aside className="bv-sidebar">
          <div className="bv-sidebar-header">
            <span className="bv-eyebrow">Session Briefs</span>
            <span className="bv-count">{briefs.length}</span>
          </div>
          {briefs.length === 0 ? (
            <p className="bv-empty-list">No briefs yet.</p>
          ) : (
            <ul className="bv-list" role="listbox" aria-label="Session briefs">
              {briefs.map(b => (
                <li
                  key={b.filename}
                  className={`bv-list-item${activeBrief?.filename === b.filename ? ' bv-list-item--active' : ''}`}
                  onClick={() => handleSelect(b)}
                  role="option"
                  aria-selected={activeBrief?.filename === b.filename}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleSelect(b); }}
                >
                  <span className="bv-item-date">{formatDate(b.uploadedAt)}</span>
                  <span className="bv-item-time">{formatTime(b.uploadedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Content pane */}
        <main className="bv-main">
          {!activeBrief && (
            <div className="bv-empty-pane">Select a brief</div>
          )}
          {activeBrief && loadingBrief && (
            <div className="bv-loading">
              <div className="bv-loading-ring" role="status" aria-label="Loading brief" />
            </div>
          )}
          {activeBrief && !loadingBrief && content && (
            <article className="bv-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          )}
        </main>

      </div>
    </div>
  );
}
