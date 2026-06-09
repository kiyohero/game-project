// ランキング機能 - Game Project

const Ranking = {
  // ニックネーム用の形容詞リスト
  adjectives: [
    'きままな', 'のんびり', 'せっかち', 'おだやかな', 'ひょうきんな',
    'まじめな', 'ゆかいな', 'おっとり', 'げんきな', 'しずかな',
    'あわてんぼうの', 'のんきな', 'おちゃめな', 'やさしい', 'くいしんぼうの',
    'ねぼすけ', 'わんぱく', 'おしゃれな', 'ふしぎな', 'すばやい'
  ],

  // ニックネーム用の動物リスト（水族館の生き物中心）
  animals: [
    'カバ', 'サメ', 'ペンギン',
    'イルカ', 'アザラシ', 'ラッコ', 'クラゲ',
    'マンボウ', 'カメ', 'タコ', 'イカ',
    'クマノミ', 'エイ', 'チンアナゴ', 'カワウソ', 'オットセイ',
    'クジラ', 'シャチ', 'フグ', 'タツノオトシゴ', 'カニ'
  ],

  // GithubDB を優先、Firebase をフォールバック
  isAvailable() {
    return Boolean(
      (window.GithubDB && window.GithubDB.isConfigured()) ||
      (window.FirebaseServices && window.FirebaseServices.enabled && window.db)
    );
  },

  // GithubDB が使用可能か
  useGithubDB() {
    return Boolean(window.GithubDB && window.GithubDB.isConfigured());
  },

  getDb() {
    return (window.FirebaseServices && window.FirebaseServices.enabled && window.db)
      ? window.db
      : null;
  },

  showInfoModal(title, message, buttonLabel = '閉じる', onClose = null) {
    const existingModal = document.getElementById('rankingModal')
      || document.getElementById('submitModal')
      || document.getElementById('captureModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'rankingInfoModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>${this.escapeHtml(title)}</h3>
        <p style="margin: 16px 0; color: #6b5b7a; line-height: 1.7;">${this.escapeHtml(message)}</p>
        <button class="ranking-close-btn">${this.escapeHtml(buttonLabel)}</button>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        if (onClose) onClose();
      }, 300);
    };

    modal.querySelector('.ranking-close-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  },

  // ランキングを取得（Top 10）
  async getTop10(gameId) {
    const db = this.getDb();
    if (!db) return [];

    try {
      const snapshot = await db.collection('rankings')
        .doc(gameId)
        .collection('scores')
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('ランキング取得エラー:', error);
      return [];
    }
  },

  // スコアを登録
  async submitScore(gameId, score, nickname = '') {
    const db = this.getDb();
    if (!db) return false;

    try {
      const sanitizedNickname = nickname.trim().slice(0, 10) || 'ななし';

      await db.collection('rankings')
        .doc(gameId)
        .collection('scores')
        .add({
          nickname: sanitizedNickname,
          score: score,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

      return true;
    } catch (error) {
      console.error('スコア登録エラー:', error);
      return false;
    }
  },

  // ランダムニックネームを生成する
  _randomNickname() {
    const adj = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    return adj + animal;
  },

  // モーダルを閉じるヘルパー
  _closeModal(modal, callback) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      if (typeof callback === 'function') callback();
    }, 300);
  },

  // モーダルを開くヘルパー（共通の show アニメーション）
  _openModal(modal) {
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  },

  // ランキングモーダルを表示
  async showRankingModal(gameId, currentScore = null) {
    if (!this.useGithubDB()) return;

    // 既存モーダルを閉じる
    ['rankingModal', 'submitModal', 'captureModal', 'rankingInfoModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'rankingModal';

    // ローディング表示
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>🏆 ランキング</h3>
        <div class="ranking-loading">
          <div style="font-size:2rem; animation: spin 1s linear infinite; display:inline-block;">⏳</div>
          <p style="margin-top:8px;">よみこみ中…</p>
        </div>
        <button class="ranking-close-btn">閉じる</button>
      </div>
    `;

    // スピンアニメーションがなければ追加
    if (!document.getElementById('ranking-spin-style')) {
      const style = document.createElement('style');
      style.id = 'ranking-spin-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    const closeHandler = () => this._closeModal(modal, null);
    // モーダル背景クリックと閉じるボタンをまとめて委譲（innerHTML 上書き後も有効）
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('ranking-close-btn')) closeHandler();
    });

    this._openModal(modal);

    // データ取得
    let entries = [];
    try {
      entries = await window.GithubDB.getCollection(`rankings/${gameId}.json`);
    } catch (e) {
      console.warn('[Ranking] getCollection error:', e);
    }

    // Top10 を抽出（score 降順でソート済みのはずだが念のため）
    const top10 = entries
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);

    const rankingContent = modal.querySelector('.ranking-content');

    if (top10.length === 0) {
      rankingContent.innerHTML = `
        <h3>🏆 ランキング</h3>
        <div class="ranking-empty">まだ記録がありません</div>
        <button class="ranking-close-btn">閉じる</button>
      `;
    } else {
      const medals = ['🥇', '🥈', '🥉'];
      const items = top10.map((entry, i) => {
        const isCurrentScore = currentScore !== null && entry.score === currentScore;
        const highlight = isCurrentScore
          ? 'outline: 2px solid #9b8ab8; outline-offset: -2px;'
          : '';
        const medal = medals[i] || '';
        return `
          <li class="ranking-item" style="${highlight}">
            <span class="ranking-position">${medal || (i + 1)}</span>
            <span class="ranking-name">${this.escapeHtml(entry.nickname || 'ななし')}</span>
            <span class="ranking-score">${this.escapeHtml(String(entry.score ?? ''))}</span>
          </li>
        `;
      }).join('');

      rankingContent.innerHTML = `
        <h3>🏆 ランキング</h3>
        <ul class="ranking-list">${items}</ul>
        <button class="ranking-close-btn">閉じる</button>
      `;
    }
  },

  // スコア登録モーダルを表示
  showSubmitModal(gameId, score, charData, onComplete) {
    // 引数の互換性（charDataを省略してonCompleteを3番目に渡せる）
    if (typeof charData === 'function') {
      onComplete = charData;
      charData = null;
    }

    // GithubDB が未設定なら即座に完了コールバックを呼ぶ（stub 動作を維持）
    if (!this.useGithubDB()) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    // 既存モーダルを閉じる
    ['rankingModal', 'submitModal', 'captureModal', 'rankingInfoModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const defaultNickname = this._randomNickname();
    const adj = this.adjectives[0];
    const animal = this.animals[0];

    // セレクト用オプション生成
    const adjOptions = this.adjectives
      .map(a => `<option value="${this.escapeHtml(a)}"${a === this.adjectives[0] ? ' selected' : ''}>${this.escapeHtml(a)}</option>`)
      .join('');
    const animalOptions = this.animals
      .map(a => `<option value="${this.escapeHtml(a)}"${a === this.animals[0] ? ' selected' : ''}>${this.escapeHtml(a)}</option>`)
      .join('');

    // ランダム初期値
    const initAdj = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const initAnimal = this.animals[Math.floor(Math.random() * this.animals.length)];

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'submitModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>🎉 スコア登録</h3>
        <div class="submit-area">
          <p>スコア：<strong>${this.escapeHtml(String(score))}</strong></p>
          <p class="nickname-label" style="margin-top:12px;">なまえをえらんでね</p>
          <div class="nickname-selects">
            <select class="nickname-select" id="submitAdjSelect">${adjOptions}</select>
            <select class="nickname-select" id="submitAnimalSelect">${animalOptions}</select>
          </div>
          <p class="nickname-preview" id="submitNicknamePreview"></p>
          <div class="submit-buttons">
            <button class="btn secondary" id="submitCancelBtn">やめる</button>
            <button class="btn" id="submitSendBtn">登録する</button>
          </div>
        </div>
      </div>
    `;

    // ランダム初期値をセット
    const adjSel = modal.querySelector('#submitAdjSelect');
    const animalSel = modal.querySelector('#submitAnimalSelect');
    adjSel.value = initAdj;
    animalSel.value = initAnimal;

    const preview = modal.querySelector('#submitNicknamePreview');
    const updatePreview = () => {
      preview.textContent = adjSel.value + animalSel.value;
    };
    updatePreview();

    adjSel.addEventListener('change', updatePreview);
    animalSel.addEventListener('change', updatePreview);

    const finish = (callback) => this._closeModal(modal, callback);

    modal.querySelector('#submitCancelBtn').addEventListener('click', () => {
      finish(() => { if (typeof onComplete === 'function') onComplete(); });
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        finish(() => { if (typeof onComplete === 'function') onComplete(); });
      }
    });

    modal.querySelector('#submitSendBtn').addEventListener('click', async () => {
      const nickname = (adjSel.value + animalSel.value).trim().slice(0, 20) || 'ななし';
      const sendBtn = modal.querySelector('#submitSendBtn');
      const cancelBtn = modal.querySelector('#submitCancelBtn');

      // ローディング状態
      sendBtn.textContent = '送信中…';
      sendBtn.disabled = true;
      cancelBtn.disabled = true;

      let success = false;
      try {
        success = await window.GithubDB.addToCollection(
          `rankings/${gameId}.json`,
          { nickname, score },
          { maxItems: 100, orderBy: 'score', order: 'desc' }
        );
      } catch (e) {
        console.warn('[Ranking] addToCollection error:', e);
        success = false;
      }

      // 結果メッセージを表示してから閉じる
      const submitArea = modal.querySelector('.submit-area');
      submitArea.innerHTML = success
        ? `<div class="submit-done">✅ 登録しました！</div>`
        : `<div class="submit-done" style="background:#fce4e4; color:#c62828;">登録できませんでした</div>`;

      setTimeout(() => {
        finish(() => { if (typeof onComplete === 'function') onComplete(); });
      }, 1200);
    });

    this._openModal(modal);
  },

  // キャプチャ履歴モーダルを表示
  async showCaptureModal(gameId) {
    if (!this.useGithubDB()) return;

    // 既存モーダルを閉じる
    ['rankingModal', 'submitModal', 'captureModal', 'rankingInfoModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'captureModal';

    modal.innerHTML = `
      <div class="ranking-content">
        <h3>📋 キャプチャ履歴</h3>
        <div class="ranking-loading">
          <div style="font-size:2rem; animation: spin 1s linear infinite; display:inline-block;">⏳</div>
          <p style="margin-top:8px;">よみこみ中…</p>
        </div>
        <button class="ranking-close-btn">閉じる</button>
      </div>
    `;

    // スピンアニメーションがなければ追加
    if (!document.getElementById('ranking-spin-style')) {
      const style = document.createElement('style');
      style.id = 'ranking-spin-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    const closeHandler = () => this._closeModal(modal, null);
    // モーダル背景クリックと閉じるボタンをまとめて委譲（innerHTML 上書き後も有効）
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('ranking-close-btn')) closeHandler();
    });

    this._openModal(modal);

    // データ取得
    let captures = [];
    try {
      captures = await window.GithubDB.getCollection(`captures/${gameId}.json`);
    } catch (e) {
      console.warn('[Ranking] getCollection (captures) error:', e);
    }

    const captureContent = modal.querySelector('.ranking-content');

    if (captures.length === 0) {
      captureContent.innerHTML = `
        <h3>📋 キャプチャ履歴</h3>
        <div class="ranking-empty">まだキャプチャがありません</div>
        <button class="ranking-close-btn">閉じる</button>
      `;
    } else {
      const items = captures.map(entry => {
        // リモートDB由来の値をstyle属性に埋め込むため、属性を破壊できないHEXカラーのみ許可
        const isValidColor = (v) => /^#[0-9a-f]{3,8}$/i.test(v);
        const badgeStyle = entry.charTypeColor && isValidColor(entry.charTypeColor)
          ? `background:${entry.charTypeColor};`
          : 'background:#9b8ab8;';
        const timeStr = entry._ts
          ? new Date(entry._ts).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
          : '';
        return `
          <div class="capture-item">
            <div class="capture-emoji">${this.escapeHtml(entry.charEmoji || '❓')}</div>
            <div class="capture-info">
              <div class="capture-char-name">${this.escapeHtml(entry.charName || '???')}</div>
              <div class="capture-meta">
                ${entry.charTypeEmoji && entry.charType
                  ? `<span class="capture-type-badge" style="${badgeStyle}">${this.escapeHtml(entry.charTypeEmoji + ' ' + entry.charType)}</span>`
                  : ''}
                ${entry.nickname ? `<span class="capture-catcher">${this.escapeHtml(entry.nickname)}</span>` : ''}
              </div>
            </div>
            <div class="capture-time">${this.escapeHtml(timeStr)}</div>
          </div>
        `;
      }).join('');

      captureContent.innerHTML = `
        <h3>📋 キャプチャ履歴</h3>
        <div class="capture-list">${items}</div>
        <button class="ranking-close-btn">閉じる</button>
      `;
    }
  },

  // キャプチャを保存
  async saveCapture(gameId, charData, nickname) {
    // GithubDB を優先
    if (this.useGithubDB()) {
      try {
        return await window.GithubDB.addToCollection(
          `captures/${gameId}.json`,
          {
            nickname: nickname,
            charEmoji: charData.emoji,
            charName: charData.name,
            charType: charData.type,
            charTypeEmoji: charData.typeEmoji,
            charTypeColor: charData.typeColor,
            charBarcode: charData.barcode
          },
          { maxItems: 200, orderBy: '_ts', order: 'desc' }
        );
      } catch (error) {
        console.error('キャプチャ保存エラー (GithubDB):', error);
        return false;
      }
    }

    // Firebase フォールバック
    const db = this.getDb();
    if (!db) return false;

    try {
      await db.collection('captures')
        .doc(gameId)
        .collection('history')
        .add({
          nickname: nickname,
          charEmoji: charData.emoji,
          charName: charData.name,
          charType: charData.type,
          charTypeEmoji: charData.typeEmoji,
          charTypeColor: charData.typeColor,
          charBarcode: charData.barcode,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      return true;
    } catch (error) {
      console.error('キャプチャ保存エラー (Firebase):', error);
      return false;
    }
  },

  // 最近のキャプチャ履歴を取得
  async getRecentCaptures(gameId, limitCount = 20) {
    const db = this.getDb();
    if (!db) return [];

    try {
      const snapshot = await db.collection('captures')
        .doc(gameId)
        .collection('history')
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('キャプチャ取得エラー:', error);
      return [];
    }
  },

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
