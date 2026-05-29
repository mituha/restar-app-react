/**
 * Git File Status representing a single modified/untracked file.
 */
export interface GitFileStatus {
  path: string;
  index: string;      // Git status code for index (staged)
  working_dir: string; // Git status code for working directory (unstaged)
}

/**
 * Git Log Entry representing a single commit in history.
 */
export interface GitLogEntry {
  hash: string;
  date: string;
  message: string;
  author_name: string;
  author_email: string;
  refs: string;
  parents: string[];
}

/**
 * Interface that the host application must implement and inject
 * to handle actual Git operations.
 */
export interface GitClient {
  init(dir: string): Promise<void>;
  status(dir: string): Promise<GitFileStatus[]>;
  log(dir: string): Promise<GitLogEntry[]>;
  add(dir: string, files: string[]): Promise<void>;
  reset(dir: string, files: string[]): Promise<void>;
  commit(dir: string, message: string): Promise<void>;
  discard(dir: string, file: string): Promise<void>; // Discard changes (VSCode feature)
  getRemotes(dir: string): Promise<string[]>;
  currentBranch(dir: string): Promise<string>;
  push(dir: string, remote: string, branch: string): Promise<void>;
}

/**
 * Locale resource structure for localizing the Git UI.
 */
export interface GitUILocale {
  sections: {
    stagedChanges: string;
    changes: string;
    history: string;
  };
  actions: {
    commit: string;
    committing: string;
    push: string;
    pushing: string;
    initRepo: string;
    refresh: string;
    stageAll: string;
    unstageAll: string;
    stageFile: string;
    unstageFile: string;
    discardFile: string;
  };
  placeholders: {
    commitMessage: string;
    insertDateTime: string;
    noStagedFiles: string;
    noChanges: string;
    noRepository: string;
  };
  status: {
    untracked: string;
    added: string;
    deleted: string;
    modified: string;
    renamed: string;
  };
}

/**
 * Default localization in Japanese (matching novelaid style).
 */
export const defaultLocale: GitUILocale = {
  sections: {
    stagedChanges: 'ステージ済みの変更',
    changes: '変更',
    history: 'コミット履歴',
  },
  actions: {
    commit: 'コミット',
    committing: 'コミット中...',
    push: 'Push',
    pushing: 'Push中...',
    initRepo: 'リポジトリを初期化',
    refresh: '更新',
    stageAll: 'すべてステージに追加',
    unstageAll: 'すべてステージ解除',
    stageFile: 'ステージに追加',
    unstageFile: 'ステージ解除',
    discardFile: '変更を破棄',
  },
  placeholders: {
    commitMessage: 'メッセージ (Ctrl+Enter でコミット)',
    insertDateTime: '日時を挿入',
    noStagedFiles: 'ステージされたファイルはありません',
    noChanges: '変更はありません',
    noRepository: '書庫（リポジトリ）が開かれていません。',
  },
  status: {
    untracked: 'U',
    added: 'A',
    deleted: 'D',
    modified: 'M',
    renamed: 'R',
  },
};
