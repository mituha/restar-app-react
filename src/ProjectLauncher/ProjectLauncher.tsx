import React, { useState } from 'react';
import { FolderOpen, Plus, Clock, X, Book } from 'lucide-react';
import type { ProjectLauncherProps } from './types';
import './ProjectLauncher.css';


/**
 * プロジェクトランチャーコンポーネント
 * プロジェクトの選択、新規作成、最近使用した項目の管理を行います。
 */
export const ProjectLauncher: React.FC<ProjectLauncherProps> = ({
  title = 'Project Launcher',
  subtitle = 'プロジェクトを選択してください',
  version,
  logoIcon = <Book size={48} className="logo-icon" />,
  recentProjects = [],
  recentLabel = '最近使ったプロジェクト',
  emptyRecentMessage = '最近使ったプロジェクトはありません',
  removeRecentTitle = '一覧から削除',
  onRemoveRecent,
  onOpenProject,
  onPickDirectory,
  onCreateProject,
  labels,
  isBackEnabled = false,
  onBack,
}) => {
  // 内部状態
  const [isCreating, setIsCreating] = useState(false);
  const [parentDir, setParentDir] = useState('');
  const [projectName, setProjectName] = useState('');
  const [cloneUrl, setCloneUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ラベルのデフォルト値
  const uiLabels = {
    openFolder: labels?.openFolder || '既存のフォルダを開く',
    openFolderDesc: labels?.openFolderDesc || 'PC上の既存のプロジェクトを選択します',
    createProject: labels?.createProject || '新しいプロジェクトを作成',
    createProjectDesc: labels?.createProjectDesc || '新しいプロジェクト環境をセットアップします',
    parentDirLabel: labels?.parentDirLabel || '保存先フォルダー',
    projectNameLabel: labels?.projectNameLabel || 'プロジェクト名',
    cloneUrlLabel: labels?.cloneUrlLabel || 'クローンURL（オプション）',
    createButton: labels?.createButton || '作成',
    creatingButton: labels?.creatingButton || '処理中...',
    cloneAndCreateButton: labels?.cloneAndCreateButton || 'クローンして作成',
    cancelButton: labels?.cancelButton || 'キャンセル',
    browseButton: labels?.browseButton || '参照',
    backButtonTitle: labels?.backButtonTitle || '戻る',
  };

  const handleOpenFolder = async () => {
    const path = await onPickDirectory();
    if (path) {
      await onOpenProject(path);
    }
  };

  const handlePickParentDir = async () => {
    const path = await onPickDirectory();
    if (path) {
      setParentDir(path);
    }
  };

  const handleCreateProject = async () => {
    if (!onCreateProject || !parentDir || !projectName) return;

    setIsProcessing(true);
    try {
      const targetPath = await onCreateProject({
        parentDir,
        name: projectName,
        cloneUrl: cloneUrl.trim() || undefined,
      });
      if (targetPath) {
        await onOpenProject(targetPath);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveRecent = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    if (onRemoveRecent) {
      await onRemoveRecent(path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onOpenProject(path);
    }
  };

  let submitButtonText = uiLabels.createButton;
  if (isProcessing) {
    submitButtonText = uiLabels.creatingButton;
  } else if (cloneUrl.trim()) {
    submitButtonText = uiLabels.cloneAndCreateButton;
  }

  return (
    <div className="launcher-container">
      <div className="launcher-card">
        <div className="launcher-header">
          {isBackEnabled && onBack && (
            <button
              type="button"
              className="launcher-close-btn"
              onClick={onBack}
              title={uiLabels.backButtonTitle}
            >
              <X size={20} />
            </button>
          )}
          {logoIcon}
          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>

        <div className="launcher-content">
          <div className="recent-section">
            <div className="section-header">
              <Clock size={16} />
              <span>{recentLabel}</span>
            </div>
            <div className="recent-list">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div
                    key={project.path}
                    className="recent-item"
                    onClick={() => onOpenProject(project.path)}
                    onKeyDown={(e) => handleKeyDown(e, project.path)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="item-info">
                      <span className="item-name">{project.name}</span>
                      <span className="item-path">{project.path}</span>
                    </div>
                    {onRemoveRecent && (
                      <button
                        type="button"
                        className="remove-recent"
                        onClick={(e) => handleRemoveRecent(e, project.path)}
                        title={removeRecentTitle}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-recent">{emptyRecentMessage}</div>
              )}
            </div>
          </div>

          <div className="actions-section">
            {!isCreating ? (
              <>
                <button
                  type="button"
                  className="action-button primary"
                  onClick={handleOpenFolder}
                >
                  <FolderOpen size={20} />
                  <div className="button-text">
                    <span className="label">{uiLabels.openFolder}</span>
                    <span className="desc">{uiLabels.openFolderDesc}</span>
                  </div>
                </button>
                {onCreateProject && (
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus size={20} />
                    <div className="button-text">
                      <span className="label">{uiLabels.createProject}</span>
                      <span className="desc">{uiLabels.createProjectDesc}</span>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="creation-section">
                <div className="section-header">
                  <Plus size={16} />
                  <span>{uiLabels.createProject}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="parent-dir">
                    {uiLabels.parentDirLabel}
                    <div className="input-with-button">
                      <input
                        id="parent-dir"
                        type="text"
                        className="launcher-input"
                        value={parentDir}
                        readOnly
                        placeholder={uiLabels.browseButton + "..."}
                      />
                      <button
                        type="button"
                        className="browse-btn"
                        onClick={handlePickParentDir}
                      >
                        {uiLabels.browseButton}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="project-name">
                    {uiLabels.projectNameLabel}
                    <input
                      id="project-name"
                      type="text"
                      className="launcher-input"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="MyProject"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="clone-url">
                    {uiLabels.cloneUrlLabel}
                    <input
                      id="clone-url"
                      type="text"
                      className="launcher-input"
                      value={cloneUrl}
                      onChange={(e) => setCloneUrl(e.target.value)}
                      placeholder="https://github.com/user/repo.git"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="form-btn cancel"
                    onClick={() => setIsCreating(false)}
                    disabled={isProcessing}
                  >
                    {uiLabels.cancelButton}
                  </button>
                  <button
                    type="button"
                    className="form-btn submit"
                    onClick={handleCreateProject}
                    disabled={isProcessing || !parentDir || !projectName}
                  >
                    {submitButtonText}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {version && (
          <div className="launcher-footer">
            <span>Version {version}</span>
          </div>
        )}
      </div>
    </div>
  );
};
