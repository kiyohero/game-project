// 共通スクリプト - Game Project

(function() {
  const pathname = location.pathname;

  // index.html以外のページにナビゲーションを追加
  if (!pathname.endsWith('index.html') && pathname !== '/') {
    const nav = document.createElement('a');
    // games/フォルダ内からindex.htmlへのリンク
    // ベースパスに対応: /game-project/games/2048.html -> /game-project/index.html
    if (pathname.includes('/games/')) {
      // games/フォルダを含む場合、ベースパスを検出して適切に設定
      const basePath = pathname.substring(0, pathname.lastIndexOf('/games/'));
      nav.href = basePath + '/index.html';
    } else {
      // デフォルト: 相対パス
      nav.href = '../index.html';
    }
    nav.className = 'back-link';
    nav.textContent = '← ゲーム一覧';
    document.body.insertBefore(nav, document.body.firstChild);

    // アクセス履歴を記録
    const filename = pathname.split('/').pop();
    if (filename && filename.endsWith('.html')) {
      try {
        const history = JSON.parse(localStorage.getItem('gameHistory') || '{}');
        history[filename] = Date.now();
        localStorage.setItem('gameHistory', JSON.stringify(history));
      } catch (e) {}
    }
  }
})();
