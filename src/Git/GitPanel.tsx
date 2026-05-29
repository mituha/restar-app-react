import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Minus,
  GitCommit,
  Database,
  ChevronDown,
  ChevronRight,
  GitBranch,
  ArrowUp,
  RotateCcw,
} from 'lucide-react';
import { useGit } from './GitContext';
import { GitGraph } from './GitGraph';
import { defaultLocale } from './types';
import type { GitUILocale, GitFileStatus } from './types';
import './GitPanel.css';

interface GitPanelProps {
  onOpenFileDiff: (path: string, staged: boolean, commitHash?: string) => void;
  locale?: GitUILocale;
}

export const GitPanel: React.FC<GitPanelProps> = ({
  onOpenFileDiff,
  locale = defaultLocale,
}) => {
  const {
    status,
    history,
    currentDir,
    remotes,
    currentBranch,
    refreshStatus,
    refreshHistory,
    initRepo,
    stageFiles,
    unstageFiles,
    commitChanges,
    discardFile,
    pushChanges,
  } = useGit();

  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [selectedRemote, setSelectedRemote] = useState('origin');

  // Accordion state
  const [expanded, setExpanded] = useState({
    staged: true,
    changes: true,
    history: true,
  });

  const { commitFiles } = useGit();
  const [selectedCommitHash, setSelectedCommitHash] = useState<string | null>(null);
  const [commitFilesMap, setCommitFilesMap] = useState<Record<string, GitFileStatus[]>>({});
  const [loadingCommits, setLoadingCommits] = useState<Record<string, boolean>>({});

  const handleCommitClick = async (hash: string) => {
    if (selectedCommitHash === hash) {
      setSelectedCommitHash(null);
      return;
    }
    setSelectedCommitHash(hash);
    if (!commitFilesMap[hash] && !loadingCommits[hash]) {
      setLoadingCommits(prev => ({ ...prev, [hash]: true }));
      try {
        const files = await commitFiles(hash);
        setCommitFilesMap(prev => ({ ...prev, [hash]: files }));
      } catch (err) {
        console.error('Failed to load commit files', err);
      } finally {
        setLoadingCommits(prev => ({ ...prev, [hash]: false }));
      }
    }
  };

  useEffect(() => {
    if (remotes.length > 0 && !remotes.includes(selectedRemote)) {
      setSelectedRemote(remotes[0]);
    }
  }, [remotes, selectedRemote]);

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const stagedFiles = status.filter((f) => f.index !== ' ' && f.index !== '?');
  const unstagedFiles = status.filter(
    (f) => f.working_dir !== ' ' || f.index === '?',
  );

  const handleStageAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const files = unstagedFiles.map((s) => s.path);
    if (files.length > 0) {
      await stageFiles(files);
    }
  };

  const handleUnstageAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const files = stagedFiles.map((s) => s.path);
    if (files.length > 0) {
      await unstageFiles(files);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage || stagedFiles.length === 0) return;
    setIsCommitting(true);
    try {
      await commitChanges(commitMessage);
      setCommitMessage('');
    } catch (err) {
      console.error('Commit failed:', err);
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRemote) return;
    setIsPushing(true);
    try {
      await pushChanges(selectedRemote);
    } catch (error) {
      console.error('Push failed:', error);
      alert('Push failed. Check console for details.');
    } finally {
      setIsPushing(false);
    }
  };

  const getStatusLabel = (file: any) => {
    if (file.index === '?' && file.working_dir === '?') return 'U'; // Untracked
    if (file.index === 'A' || file.working_dir === 'A') return 'A'; // Added
    if (file.index === 'D' || file.working_dir === 'D') return 'D'; // Deleted
    if (file.index === 'R' || file.working_dir === 'R') return 'R'; // Renamed
    return 'M'; // Modified
  };

  if (!currentDir) {
    return (
      <div className="git-ui-root">
        <div className="git-panel-empty">{locale.placeholders.noRepository}</div>
      </div>
    );
  }

  return (
    <div className="git-ui-root">
      <div className="git-panel-container">
        {/* Header */}
        <div className="git-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <GitBranch size={16} />
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentBranch || 'No Branch'}
            </span>
          </div>
          <button
            className="git-panel-refresh-btn"
            type="button"
            onClick={async () => {
              await refreshStatus();
              await refreshHistory();
            }}
            title={locale.actions.refresh}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Commit Input Area */}
        <div className="git-panel-section commit-section">
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="git-panel-commitInput"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder={locale.placeholders.commitMessage}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') handleCommit();
              }}
            />
            <button
              type="button"
              className="git-panel-iconBtn"
              title={locale.placeholders.insertDateTime}
              onClick={() => {
                const now = new Date();
                const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(
                  now.getDate()
                ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
                  now.getMinutes()
                ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                setCommitMessage((prev) => (prev ? `${prev} ${dateStr}` : dateStr));
              }}
              style={{ padding: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}
            >
              日時
            </button>
          </div>

          <button
            className="git-panel-commitBtn"
            type="button"
            onClick={handleCommit}
            disabled={isCommitting || !commitMessage || stagedFiles.length === 0}
          >
            <GitCommit size={16} />
            {isCommitting ? locale.actions.committing : locale.actions.commit}
          </button>

          {/* Remote Push Area */}
          {remotes.length > 0 && (
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--git-ui-border)', paddingTop: '12px' }}>
              <div style={{ marginBottom: '6px', fontSize: '11px', color: 'var(--git-ui-text-secondary)' }}>
                Push to Remote ({currentBranch})
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--git-ui-input-bg)',
                    color: 'var(--git-ui-text-primary)',
                    border: '1px solid var(--git-ui-input-border)',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '12px',
                  }}
                  value={selectedRemote}
                  onChange={(e) => setSelectedRemote(e.target.value)}
                >
                  {remotes.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="git-panel-commitBtn"
                  onClick={handlePush}
                  disabled={isPushing}
                  style={{ flex: '0.8', padding: '4px 8px', fontSize: '12px' }}
                >
                  {isPushing ? <RefreshCw size={14} className="spin" /> : <ArrowUp size={14} />}
                  Push
                </button>
              </div>
            </div>
          )}

          {history.length === 0 && (
            <button
              type="button"
              onClick={initRepo}
              className="git-panel-initBtn"
              style={{ marginTop: '12px' }}
            >
              <Database size={14} />
              {locale.actions.initRepo}
            </button>
          )}
        </div>

        {/* Staged Changes Accordion */}
        <div className="git-panel-section">
          <div
            className="git-panel-section-header"
            onClick={() => toggleSection('staged')}
          >
            {expanded.staged ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="git-panel-section-title">{locale.sections.stagedChanges}</span>
            <span className="git-panel-section-count">{stagedFiles.length}</span>
            <div className="git-panel-section-actions">
              {stagedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleUnstageAll}
                  className="git-panel-refresh-btn"
                  title={locale.actions.unstageAll}
                  style={{ padding: '2px' }}
                >
                  <Minus size={14} />
                </button>
              )}
            </div>
          </div>
          {expanded.staged && (
            <div className="git-panel-section-content">
              {stagedFiles.length === 0 ? (
                <div className="git-panel-empty">{locale.placeholders.noStagedFiles}</div>
              ) : (
                <ul className="git-panel-fileList">
                  {stagedFiles.map((file) => (
                    <li key={file.path} className="git-panel-fileItem" onClick={() => onOpenFileDiff(file.path, true)}>
                      <span className={`git-panel-status status-${getStatusLabel(file)}`}>
                        {getStatusLabel(file)}
                      </span>
                      <span className="git-panel-path" title={file.path}>
                        {file.path}
                      </span>
                      <div className="git-panel-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="git-panel-iconBtn"
                          onClick={() => unstageFiles([file.path])}
                          title={locale.actions.unstageFile}
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Changes Accordion */}
        <div className="git-panel-section">
          <div
            className="git-panel-section-header"
            onClick={() => toggleSection('changes')}
          >
            {expanded.changes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="git-panel-section-title">{locale.sections.changes}</span>
            <span className="git-panel-section-count">{unstagedFiles.length}</span>
            <div className="git-panel-section-actions">
              {unstagedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleStageAll}
                  className="git-panel-refresh-btn"
                  title={locale.actions.stageAll}
                  style={{ padding: '2px' }}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
          {expanded.changes && (
            <div className="git-panel-section-content">
              {unstagedFiles.length === 0 ? (
                <div className="git-panel-empty">{locale.placeholders.noChanges}</div>
              ) : (
                <ul className="git-panel-fileList">
                  {unstagedFiles.map((file) => (
                    <li key={file.path} className="git-panel-fileItem" onClick={() => onOpenFileDiff(file.path, false)}>
                      <span className={`git-panel-status status-${getStatusLabel(file)}`}>
                        {getStatusLabel(file)}
                      </span>
                      <span className="git-panel-path" title={file.path}>
                        {file.path}
                      </span>
                      <div className="git-panel-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="git-panel-iconBtn"
                          onClick={() => discardFile(file.path)}
                          title={locale.actions.discardFile}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          type="button"
                          className="git-panel-iconBtn"
                          onClick={() => stageFiles([file.path])}
                          title={locale.actions.stageFile}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* History Accordion */}
        <div className="git-panel-section">
          <div
            className="git-panel-section-header"
            onClick={() => toggleSection('history')}
          >
            {expanded.history ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="git-panel-section-title">{locale.sections.history}</span>
            <span className="git-panel-section-count">{history.length}</span>
          </div>
          {expanded.history && (
            <div className="git-panel-section-content" style={{ display: 'flex', flexDirection: 'row', minHeight: 'min-content', backgroundColor: 'var(--git-ui-bg)' }}>
              <div style={{ flexShrink: 0, width: '24px', overflow: 'hidden' }}>
                <GitGraph history={history} />
              </div>

              {/* Text list of commits (Right side) */}
              <ul className="git-panel-historyList" style={{ flex: 1, margin: 0, padding: 0, listStyle: 'none', overflow: 'hidden' }}>
                {history.map((entry) => {
                  const isSelected = selectedCommitHash === entry.hash;

                  return (
                    <li
                      key={entry.hash}
                      className={`git-panel-historyItem ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCommitClick(entry.hash)}
                      style={{
                        height: '34px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0 8px 0 20px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        backgroundColor: isSelected ? 'var(--git-ui-item-hover)' : 'transparent',
                        borderBottom: '1px solid var(--git-ui-border)',
                        textAlign: 'left'
                      }}
                    >
                      <div className="git-panel-historyContent" style={{ width: '100%', minWidth: 0, lineHeight: 1.2 }}>
                        <div className="git-panel-historyMessage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', margin: 0 }}>
                          <span className="git-panel-message-text" title={entry.message} style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {entry.message}
                          </span>
                          {entry.refs && (
                            <span className="git-panel-badges" style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                              {entry.refs.split(', ').map((ref: string) => {
                                const cleanRef = ref.trim();
                                let color = '#2e7d32'; // Local branch
                                if (cleanRef.includes('HEAD ->')) {
                                  color = '#00838f'; // Current branch
                                } else if (cleanRef.includes('/') || cleanRef.includes('origin/')) {
                                  color = '#1565c0'; // Remote branch
                                } else if (cleanRef === 'HEAD') {
                                  color = '#ef6c00'; // Detached HEAD
                                } else if (cleanRef.startsWith('tag: ')) {
                                  color = '#7b1fa2'; // Tag
                                }

                                return (
                                  <span
                                    key={cleanRef}
                                    style={{
                                      fontSize: '8px',
                                      padding: '1px 3px',
                                      borderRadius: '3px',
                                      backgroundColor: color,
                                      color: 'white',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '60px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                    title={cleanRef}
                                  >
                                    {cleanRef.replace('HEAD ->', '')}
                                  </span>
                                );
                              })}
                            </span>
                          )}
                        </div>
                        <div className="git-panel-historyMeta" style={{ fontSize: '9px', color: 'var(--git-ui-text-secondary)', marginTop: '1px' }}>
                          {entry.author_name} • {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Selected Commit Files Accordion (dynamic section below history) */}
        {selectedCommitHash && (
          <div className="git-panel-section" style={{ borderTop: '1px solid var(--git-ui-border)' }}>
            <div className="git-panel-section-header">
              <ChevronDown size={14} />
              <span className="git-panel-section-title" style={{ fontSize: '11px' }}>
                コミット {selectedCommitHash.substring(0, 7)} の変更
              </span>
              <span className="git-panel-section-count">
                {commitFilesMap[selectedCommitHash]?.length || 0}
              </span>
            </div>
            <div className="git-panel-section-content" style={{ padding: '4px 0 8px 0' }}>
              {loadingCommits[selectedCommitHash] ? (
                <div className="git-panel-empty" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={12} className="spin" />
                  読み込み中...
                </div>
              ) : !commitFilesMap[selectedCommitHash] || commitFilesMap[selectedCommitHash].length === 0 ? (
                <div className="git-panel-empty">変更ファイルはありません</div>
              ) : (
                <ul className="git-panel-fileList" style={{ margin: 0, padding: 0 }}>
                  {commitFilesMap[selectedCommitHash].map((file) => (
                    <li
                      key={file.path}
                      className="git-panel-fileItem"
                      onClick={() => onOpenFileDiff(file.path, false, selectedCommitHash)}
                    >
                      <span className={`git-panel-status status-${getStatusLabel(file)}`}>
                        {getStatusLabel(file)}
                      </span>
                      <span className="git-panel-path" title={file.path}>
                        {file.path}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
