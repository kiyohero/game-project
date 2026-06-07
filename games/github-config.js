// GitHub DB設定 - Game Project
//
// 共有ランキング機能を有効にする場合は、window.GAME_PROJECT_GITHUB_CONFIG に実値を設定してください。
// 実値はコミットしないこと。
//
// 専用リポジトリ(game-rankings)を作成し、Fine-grained PATを発行して設定します。
// 設定方法: https://github.com/settings/personal-access-tokens

(function () {
  // ★ここに実値を入れる（コミットしないこと）
  const runtimeConfig = window.GAME_PROJECT_GITHUB_CONFIG || {
    token: 'YOUR_GITHUB_TOKEN',
    owner: 'YOUR_GITHUB_USERNAME',
    repo: 'YOUR_RANKINGS_REPO'
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
