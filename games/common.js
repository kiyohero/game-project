// 共通スクリプト - Game Project

(function() {
  const pathname = location.pathname;

  // index.html や ルートでは何もしない（従来どおり）
  if (pathname.endsWith('index.html') || pathname === '/') {
    return;
  }

  // ベースパスを解決（games/フォルダの前までをベースとする）
  let basePath;
  if (pathname.includes('/games/')) {
    basePath = pathname.substring(0, pathname.lastIndexOf('/games/'));
  } else {
    // フォールバック: 一覧は一つ上の階層
    basePath = '..';
  }

  // 現在のファイル名（クエリは pathname に含まれない）
  const filename = pathname.split('/').pop();

  // --- 固定ヘッダを body 先頭に挿入 ---
  const header = document.createElement('header');
  header.className = 'site-header';

  const back = document.createElement('a');
  back.className = 'site-back';
  back.href = basePath + '/index.html';
  back.textContent = '← 一覧';

  const title = document.createElement('span');
  title.className = 'site-title';
  title.textContent = document.title;

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'site-menu-btn';
  menuBtn.setAttribute('aria-label', 'メニュー');
  menuBtn.textContent = '☰';

  header.appendChild(back);
  header.appendChild(title);
  header.appendChild(menuBtn);
  document.body.insertBefore(header, document.body.firstChild);

  // --- ドロワー要素を body 末尾に追加 ---
  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';

  const drawer = document.createElement('nav');
  drawer.className = 'site-drawer';
  drawer.setAttribute('aria-hidden', 'true');

  const inner = document.createElement('div');
  inner.className = 'drawer-inner';
  drawer.appendChild(inner);

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // --- 開閉処理 ---
  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  menuBtn.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // --- ドロワーの中身を構築 ---
  function buildDrawer() {
    const games = window.GAME_PROJECT_GAMES;
    const categories = window.GAME_PROJECT_CATEGORIES;

    // データ未定義（読み込み失敗）
    if (!Array.isArray(games) || !Array.isArray(categories)) {
      inner.textContent = 'メニューを読み込めませんでした';
      return;
    }

    // 見出し
    const head = document.createElement('div');
    head.className = 'drawer-head';
    head.textContent = 'ゲームメニュー';
    inner.appendChild(head);

    // ランダムであそぶ（現在のゲーム以外から選ぶ）
    const randomBtn = document.createElement('button');
    randomBtn.type = 'button';
    randomBtn.className = 'drawer-random';
    randomBtn.textContent = '🎲 ランダムであそぶ';
    randomBtn.addEventListener('click', function() {
      const others = games.filter(g => g.file.split('?')[0] !== filename);
      const pool = others.length ? others : games;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      location.href = pick.file;
    });
    inner.appendChild(randomBtn);

    // カテゴリ順にゲームを列挙
    categories.forEach(function(cat) {
      const catGames = games.filter(g => g.category === cat.id);
      if (!catGames.length) return;

      const catLabel = document.createElement('div');
      catLabel.className = 'drawer-cat';
      catLabel.textContent = cat.icon + ' ' + cat.name;
      inner.appendChild(catLabel);

      catGames.forEach(function(g) {
        const isCurrent = g.file.split('?')[0] === filename;
        const link = document.createElement('a');
        link.className = 'drawer-game' + (isCurrent ? ' current' : '');
        link.href = g.file;
        link.textContent = g.icon + ' ' + g.name;
        if (isCurrent) {
          // 現在地はクリックで閉じるだけ
          link.addEventListener('click', function(e) {
            e.preventDefault();
            closeDrawer();
          });
        }
        inner.appendChild(link);
      });
    });
  }

  // --- games-data.js を動的読み込み（common.js と同階層） ---
  const s = document.createElement('script');
  s.src = 'games-data.js';
  s.onload = buildDrawer;
  s.onerror = function() {
    inner.textContent = 'メニューを読み込めませんでした';
  };
  document.head.appendChild(s);

  // --- アクセス履歴を記録（従来どおり） ---
  if (filename && filename.endsWith('.html')) {
    try {
      const history = JSON.parse(localStorage.getItem('gameHistory') || '{}');
      history[filename] = Date.now();
      localStorage.setItem('gameHistory', JSON.stringify(history));
    } catch (e) {}
  }
})();
