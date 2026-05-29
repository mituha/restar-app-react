import React, { useState } from 'react';
import { GitProvider, GitPanel } from '../../src';
import type { GitClient, GitFileStatus, GitLogEntry } from '../../src';
import { Play, RotateCcw, AlertCircle } from 'lucide-react';

// Create a stateful mock Git client that runs in-memory
class MockGitClient implements GitClient {
  private statusList: GitFileStatus[] = [
    { path: 'src/main.tsx', index: ' ', working_dir: 'M' },
    { path: 'src/components/Editor.tsx', index: ' ', working_dir: 'M' },
    { path: 'docs/chapter1.txt', index: '?', working_dir: '?' },
  ];

  private historyList: GitLogEntry[] = [
    {
      hash: 'a1b2c3d',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      message: '第1章の草稿を修正',
      author_name: 'Mizuki Mituha',
      author_email: 'mituha@example.com',
      refs: 'HEAD -> main, origin/main',
      parents: ['e5f6g7h'],
    },
    {
      hash: 'e5f6g7h',
      date: new Date(Date.now() - 3600000 * 24).toISOString(),
      message: '初期コミットとドキュメント追加',
      author_name: 'Mizuki Mituha',
      author_email: 'mituha@example.com',
      refs: '',
      parents: [],
    },
  ];

  private branch = 'main';
  private onStateChange: () => void = () => {};

  constructor() {
    this.statusList = [...this.statusList];
    this.historyList = [...this.historyList];
  }

  setListener(listener: () => void) {
    this.onStateChange = listener;
  }

  // Trigger state updates in components
  private notify() {
    this.onStateChange();
  }

  async init(_dir: string): Promise<void> {
    this.statusList = [
      { path: 'README.md', index: ' ', working_dir: 'M' }
    ];
    this.historyList = [
      {
        hash: Math.random().toString(16).substring(2, 9),
        date: new Date().toISOString(),
        message: 'Initialized repository',
        author_name: 'Mizuki Mituha',
        author_email: 'mituha@example.com',
        refs: 'HEAD -> main',
        parents: [],
      }
    ];
    this.notify();
  }

  async status(_dir: string): Promise<GitFileStatus[]> {
    return this.statusList;
  }

  async log(_dir: string): Promise<GitLogEntry[]> {
    return this.historyList;
  }

  async add(_dir: string, files: string[]): Promise<void> {
    this.statusList = this.statusList.map((f) => {
      if (files.includes(f.path)) {
        // Stage the file
        const newIndex = f.working_dir === '?' ? 'A' : f.working_dir;
        return { ...f, index: newIndex, working_dir: ' ' };
      }
      return f;
    });
    this.notify();
  }

  async reset(_dir: string, files: string[]): Promise<void> {
    this.statusList = this.statusList.map((f) => {
      if (files.includes(f.path)) {
        // Unstage the file
        const newWorkingDir = f.index === 'A' ? '?' : f.index;
        return { ...f, index: ' ', working_dir: newWorkingDir };
      }
      return f;
    });
    this.notify();
  }

  async commit(_dir: string, message: string): Promise<void> {
    const stagedFiles = this.statusList.filter((f) => f.index !== ' ' && f.index !== '?');
    if (stagedFiles.length === 0) return;

    const newHash = Math.random().toString(16).substring(2, 9);
    const parentHash = this.historyList[0]?.hash || '';

    const newEntry: GitLogEntry = {
      hash: newHash,
      date: new Date().toISOString(),
      message,
      author_name: 'Mizuki Mituha',
      author_email: 'mituha@example.com',
      refs: `HEAD -> ${this.branch}`,
      parents: parentHash ? [parentHash] : [],
    };

    // Remove HEAD reference from previous commits
    this.historyList = this.historyList.map(h => {
      if (h.refs.includes('HEAD ->')) {
        return { ...h, refs: h.refs.replace(`HEAD -> ${this.branch}`, '').replace('HEAD ->', '').trim() };
      }
      return h;
    });

    this.historyList = [newEntry, ...this.historyList];
    // Remove staged files from status
    this.statusList = this.statusList.filter((f) => f.index === ' ' || f.index === '?');
    this.notify();
  }

  async discard(_dir: string, file: string): Promise<void> {
    // Remove file change from status
    this.statusList = this.statusList.filter((f) => f.path !== file);
    this.notify();
  }

  async getRemotes(_dir: string): Promise<string[]> {
    return ['origin'];
  }

  async currentBranch(_dir: string): Promise<string> {
    return this.branch;
  }

  async push(_dir: string, remote: string, branch: string): Promise<void> {
    // Simulate push
    this.historyList = this.historyList.map(h => {
      if (h.refs.includes(`HEAD -> ${branch}`)) {
        if (!h.refs.includes(`${remote}/${branch}`)) {
          return { ...h, refs: `${h.refs}, ${remote}/${branch}` };
        }
      }
      return h;
    });
    this.notify();
  }

  // Helper method for demo UI to inject random modifications
  generateRandomChange() {
    const paths = [
      'src/components/Sidebar.tsx',
      'src/hooks/useAuth.ts',
      'docs/index.html',
      'package.json',
      'src/style.css',
    ];
    const randomPath = paths[Math.floor(Math.random() * paths.length)];
    const existing = this.statusList.find(f => f.path === randomPath);

    if (!existing) {
      const isUntracked = Math.random() > 0.5;
      this.statusList.push({
        path: randomPath,
        index: ' ',
        working_dir: isUntracked ? '?' : 'M',
      });
    } else if (existing.working_dir === ' ') {
      existing.working_dir = 'M';
    }
    this.notify();
  }
}

export const GitDemo: React.FC = () => {
  const [mockClient] = useState(() => new MockGitClient());
  const [currentDir, setCurrentDir] = useState<string | null>('d:/home/mituha/repos/novel-editor');
  const [diffInfo, setDiffInfo] = useState<{ path: string; staged: boolean } | null>(null);

  // Subscribe context to mock state changes
  const subscribeFileChange = (onChanged: () => void) => {
    mockClient.setListener(onChanged);
    return () => {
      mockClient.setListener(() => {});
    };
  };

  const handleOpenFileDiff = (path: string, staged: boolean) => {
    setDiffInfo({ path, staged });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#181818', color: '#ccc' }}>
      {/* Control panel (Left) */}
      <div style={{ width: '320px', borderRight: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3>Git UI Demo Control</h3>
        <p style={{ fontSize: '12px', color: '#888' }}>
          このデモでは、メモリ内でGitコマンドをシミュレートする <code>MockGitClient</code> を使用しています。
        </p>

        <div>
          <button
            onClick={() => mockClient.generateRandomChange()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Play size={16} />
            ファイル変更をシミュレート
          </button>
        </div>

        <div>
          <button
            onClick={() => setCurrentDir(currentDir ? null : 'd:/home/mituha/repos/novel-editor')}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#424242',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {currentDir ? 'プロジェクトを閉じる' : 'プロジェクトを開く'}
          </button>
        </div>

        {diffInfo && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#222', borderRadius: '4px', borderLeft: '3px solid #007acc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, fontSize: '12px' }}>
              <AlertCircle size={14} />
              差分表示のリクエスト
            </div>
            <div style={{ fontSize: '11px', wordBreak: 'break-all' }}>
              <strong>ファイル:</strong> {diffInfo.path} <br />
              <strong>ステージ済み:</strong> {diffInfo.staged ? 'はい' : 'いいえ'}
            </div>
            <button
              onClick={() => setDiffInfo(null)}
              style={{
                marginTop: '10px',
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              クリア
            </button>
          </div>
        )}
      </div>

      {/* Git UI Panel (Center sidebar) */}
      <div style={{ width: '380px', borderRight: '1px solid #333', height: '100%' }}>
        <GitProvider client={mockClient} currentDir={currentDir} subscribeFileChange={subscribeFileChange}>
          <GitPanel onOpenFileDiff={handleOpenFileDiff} />
        </GitProvider>
      </div>

      {/* Mock Workspace / Diff Area (Right) */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
        {diffInfo ? (
          <div style={{ width: '80%', maxWidth: '600px', padding: '24px', backgroundColor: '#222', borderRadius: '8px', border: '1px solid #333' }}>
            <h4>Mock Diff Viewer</h4>
            <p style={{ fontSize: '12px', color: '#888' }}>
              実際のDiffビューアはホスト側（または専用ライブラリ）に委譲されます。
            </p>
            <div style={{ backgroundColor: '#1a1a1a', padding: '16px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: '#73c991' }}>
              diff --git a/{diffInfo.path} b/{diffInfo.path} <br />
              --- a/{diffInfo.path} <br />
              +++ b/{diffInfo.path} <br />
              @@ -1,4 +1,5 @@ <br />
              - // Old content <br />
              + // New modification simulated <br />
              + // Staged status: {diffInfo.staged ? 'Staged' : 'Modified'}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#555' }}>
            <RotateCcw size={48} style={{ marginBottom: '16px' }} />
            <p>ファイルをクリックして差分を表示します</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default GitDemo;
