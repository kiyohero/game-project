// 共通スクリプト - Game Project

// ナビゲーションを自動挿入
(function() {
  // index.html以外のページにナビゲーションを追加
  if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
    const nav = document.createElement('a');
    nav.href = '../index.html';
    nav.className = 'back-link';
    nav.textContent = '← ゲーム一覧';

    // bodyの最初に挿入
    document.body.insertBefore(nav, document.body.firstChild);
  }
})();
