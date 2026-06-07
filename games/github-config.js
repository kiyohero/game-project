// GitHub DB設定 - Game Project
//
// 共有ランキング機能を有効にする場合は、token に Fine-grained PAT を設定してください。
// token の実値はコミットしないこと。
//
// PAT の発行手順:
//   1. https://github.com/settings/personal-access-tokens/new を開く
//   2. Repository access → Only select repositories → kiyohero/game-rankings を選択
//   3. Permissions → Contents → Read and write
//   4. 発行したトークンを下の token に設定する

(function () {
  // ★token にのみ実値を入れる（コミットしないこと）
  const runtimeConfig = window.GAME_PROJECT_GITHUB_CONFIG || {
    token: 'YOUR_GITHUB_TOKEN',
    owner: 'kiyohero',
    repo: 'game-rankings'
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
