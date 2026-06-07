// GitHub DB設定 - Game Project
//
// game-ranking リポジトリを GitHub Contents API 経由で読み書きするための設定。
// token は GitHub Actions によりデプロイ時に注入される（git 履歴には残らない）。
// GitHub Actions Secret: RANKINGS_TOKEN に Fine-grained PAT を設定してください。

(function () {
  const runtimeConfig = window.GAME_PROJECT_GITHUB_CONFIG || {
    token: '__RANKINGS_TOKEN__',
    owner: 'kiyohero',
    repo: 'game-ranking'
  };

  function hasUsableConfig(config) {
    return Boolean(
      config &&
      config.token &&
      config.owner &&
      config.repo &&
      !String(config.token).includes('YOUR_')
    );
  }

  if (!hasUsableConfig(runtimeConfig)) {
    window.GithubDBConfig = null;
    return;
  }

  window.GithubDBConfig = runtimeConfig;
})();
