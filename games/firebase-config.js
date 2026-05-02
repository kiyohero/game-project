// Firebase設定 - Game Project
//
// 公開リポジトリには実運用のFirebase設定を含めません。
// 共有ランキングを有効にする場合は、このファイル内で
// `window.GAME_PROJECT_FIREBASE_CONFIG` を設定するか、
// このファイルの `runtimeConfig` に実値を投入してください。

(function () {
  const runtimeConfig = window.GAME_PROJECT_FIREBASE_CONFIG || null;
  const services = {
    enabled: false,
    firebase: window.firebase || null,
    db: null,
    reason: 'missing-config'
  };

  function hasUsableConfig(config) {
    return Boolean(
      config &&
      config.apiKey &&
      config.authDomain &&
      config.projectId &&
      !String(config.apiKey).includes('YOUR_')
    );
  }

  if (!window.firebase || typeof window.firebase.initializeApp !== 'function') {
    services.reason = 'missing-sdk';
    window.FirebaseServices = services;
    window.db = null;
    return;
  }

  if (!hasUsableConfig(runtimeConfig)) {
    window.FirebaseServices = services;
    window.db = null;
    return;
  }

  try {
    if (!window.firebase.apps || window.firebase.apps.length === 0) {
      window.firebase.initializeApp(runtimeConfig);
    }

    services.enabled = true;
    services.reason = 'enabled';
    services.db = window.firebase.firestore();
    window.FirebaseServices = services;
    window.db = services.db;
  } catch (error) {
    console.warn('Firebase初期化をスキップしました:', error);
    services.reason = 'init-failed';
    window.FirebaseServices = services;
    window.db = null;
  }
})();
