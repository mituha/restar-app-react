import React from 'react';

/**
 * プロジェクト情報のインターフェース
 */
export interface ProjectItem {
  /** 表示名 */
  name: string;
  /** フルパス */
  path: string;
}

/**
 * ProjectLauncherコンポーネントのProps
 */
export interface ProjectLauncherProps {
  /** アプリケーションのタイトル (デフォルト: "Project Launcher") */
  title?: string;
  /** サブタイトル (デフォルト: "プロジェクトを選択してください") */
  subtitle?: string;
  /** バージョン文字列 */
  version?: string;
  /** ロゴアイコン (lucide-react等) */
  logoIcon?: React.ReactNode;

  /** 最近使用したプロジェクトのリスト */
  recentProjects?: ProjectItem[];
  /** 最近使用したプロジェクトセクションの見出し (デフォルト: "最近使ったプロジェクト") */
  recentLabel?: string;
  /** リストが空の場合のメッセージ (デフォルト: "最近使ったプロジェクトはありません") */
  emptyRecentMessage?: string;
  /** 最近のリストから削除する際の見出し (デフォルト: "一覧から削除") */
  removeRecentTitle?: string;
  /** 最近のリストから削除する際のコールバック */
  onRemoveRecent?: (path: string) => Promise<void> | void;
  
  /** プロジェクトを開く際のアクション */
  onOpenProject: (path: string) => Promise<void> | void;
  /** フォルダー選択ダイアログを表示するアクション */
  onPickDirectory: () => Promise<string | undefined>;
  
  /** 
   * 新しいプロジェクトを作成するアクション
   * 指定されない場合、新規作成ボタンは非表示になります
   */
  onCreateProject?: (params: {
    parentDir: string;
    name: string;
    cloneUrl?: string;
  }) => Promise<string | undefined>;
  
  /** UIラベルのカスタマイズ */
  labels?: {
    /** 「既存のフォルダを開く」ボタンのラベル */
    openFolder?: string;
    /** 「既存のフォルダを開く」ボタンの説明文 */
    openFolderDesc?: string;
    /** 「新しいプロジェクトを作成」ボタンのラベル */
    createProject?: string;
    /** 「新しいプロジェクトを作成」ボタンの説明文 */
    createProjectDesc?: string;
    /** 保存先フォルダーのラベル */
    parentDirLabel?: string;
    /** プロジェクト名のラベル */
    projectNameLabel?: string;
    /** クローンURLのラベル */
    cloneUrlLabel?: string;
    /** 作成ボタンのテキスト */
    createButton?: string;
    /** 処理中のボタンテキスト */
    creatingButton?: string;
    /** クローンして作成する際のボタンテキスト */
    cloneAndCreateButton?: string;
    /** キャンセルボタンのテキスト */
    cancelButton?: string;
    /** 参照ボタンのテキスト */
    browseButton?: string;
    /** 戻るボタンのツールチップ */
    backButtonTitle?: string;
  };

  /** エディタ等への戻るボタンを表示するかどうか */
  isBackEnabled?: boolean;
  /** 戻るボタンが押された際のコールバック */
  onBack?: () => void;
}
