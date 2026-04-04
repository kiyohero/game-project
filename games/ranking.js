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

  // ランキングを取得（Top 10）
  async getTop10(gameId) {
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

  // ランキングモーダルを表示
  async showRankingModal(gameId, currentScore = null) {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('rankingModal');
    if (existingModal) {
      existingModal.remove();
    }

    // モーダルHTML作成
    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'rankingModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>🏆 ランキング</h3>
        <div class="ranking-loading">読み込み中...</div>
        <ol class="ranking-list" style="display:none;"></ol>
        <div class="ranking-empty" style="display:none;">まだ記録がありません</div>
        <button class="ranking-close-btn">閉じる</button>
      </div>
    `;

    document.body.appendChild(modal);

    // 閉じるボタン
    modal.querySelector('.ranking-close-btn').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });

    // 表示アニメーション
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });

    // ランキング取得
    const rankings = await this.getTop10(gameId);
    const loadingEl = modal.querySelector('.ranking-loading');
    const listEl = modal.querySelector('.ranking-list');
    const emptyEl = modal.querySelector('.ranking-empty');

    loadingEl.style.display = 'none';

    if (rankings.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      listEl.style.display = 'block';
      listEl.innerHTML = rankings.map((r, i) => `
        <li class="ranking-item">
          <span class="ranking-position">${i + 1}</span>
          <span class="ranking-name">${this.escapeHtml(r.nickname)}</span>
          <span class="ranking-score">${r.score.toLocaleString()}</span>
        </li>
      `).join('');
    }
  },

  // キャプチャを保存
  async saveCapture(gameId, charData, nickname) {
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
      console.error('キャプチャ保存エラー:', error);
      return false;
    }
  },

  // 最近のキャプチャ履歴を取得
  async getRecentCaptures(gameId, limitCount = 20) {
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

  // キャプチャ履歴モーダルを表示
  async showCaptureModal(gameId) {
    const existingModal = document.getElementById('captureModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'captureModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>👾 みんなのキャラ</h3>
        <div class="ranking-loading">読み込み中...</div>
        <div class="capture-list" style="display:none;"></div>
        <div class="ranking-empty" style="display:none;">まだキャプチャがありません</div>
        <button class="ranking-close-btn">閉じる</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.ranking-close-btn').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      }
    });

    requestAnimationFrame(() => modal.classList.add('show'));

    const captures = await this.getRecentCaptures(gameId, 20);
    const loadingEl = modal.querySelector('.ranking-loading');
    const listEl = modal.querySelector('.capture-list');
    const emptyEl = modal.querySelector('.ranking-empty');

    loadingEl.style.display = 'none';

    if (captures.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      listEl.style.display = 'block';
      listEl.innerHTML = captures.map(c => {
        const timeStr = c.timestamp
          ? new Date(c.timestamp.toDate()).toLocaleDateString('ja-JP', {
              month: 'numeric', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          : '';
        return `
          <div class="capture-item">
            <span class="capture-emoji">${this.escapeHtml(c.charEmoji)}</span>
            <div class="capture-info">
              <div class="capture-char-name">${this.escapeHtml(c.charName)}</div>
              <div class="capture-meta">
                <span class="capture-type-badge" style="background:${this.escapeHtml(c.charTypeColor)}">
                  ${this.escapeHtml(c.charTypeEmoji)} ${this.escapeHtml(c.charType)}
                </span>
                <span class="capture-catcher">by ${this.escapeHtml(c.nickname)}</span>
              </div>
            </div>
            <div class="capture-time">${timeStr}</div>
          </div>
        `;
      }).join('');
    }
  },

  // スコア登録モーダルを表示
  showSubmitModal(gameId, score, charData, onComplete) {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('submitModal');
    if (existingModal) {
      existingModal.remove();
    }

    // ドロップダウンのオプションを生成
    const adjOptions = this.adjectives.map(a => `<option value="${a}">${a}</option>`).join('');
    const animalOptions = this.animals.map(a => `<option value="${a}">${a}</option>`).join('');

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'submitModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>🎉 スコア: ${score.toLocaleString()}</h3>
        <div class="submit-area">
          <p>ランキングに登録する？</p>
          <p class="nickname-label">ニックネームを選んでね</p>
          <div class="nickname-selects">
            <select id="adjSelect" class="nickname-select">${adjOptions}</select>
            <select id="animalSelect" class="nickname-select">${animalOptions}</select>
          </div>
          <p class="nickname-preview" id="nicknamePreview"></p>
          <div class="submit-buttons">
            <button class="btn" id="submitBtn">登録する</button>
            <button class="btn secondary" id="skipBtn">スキップ</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const adjSelect = modal.querySelector('#adjSelect');
    const animalSelect = modal.querySelector('#animalSelect');
    const previewEl = modal.querySelector('#nicknamePreview');
    const submitBtn = modal.querySelector('#submitBtn');
    const skipBtn = modal.querySelector('#skipBtn');
    const submitArea = modal.querySelector('.submit-area');

    // プレビュー更新
    const updatePreview = () => {
      previewEl.textContent = `→ ${adjSelect.value}${animalSelect.value}`;
    };
    adjSelect.addEventListener('change', updatePreview);
    animalSelect.addEventListener('change', updatePreview);
    updatePreview();

    // 登録ボタン
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = '登録中...';

      const nickname = adjSelect.value + animalSelect.value;
      const [success] = await Promise.all([
        this.submitScore(gameId, score, nickname),
        charData ? this.saveCapture(gameId, charData, nickname) : Promise.resolve()
      ]);

      if (success) {
        submitArea.innerHTML = '<div class="submit-done">✅ 登録しました！</div>';
        setTimeout(() => {
          modal.classList.remove('show');
          setTimeout(() => {
            modal.remove();
            if (onComplete) onComplete();
          }, 300);
        }, 1000);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = '登録する';
        alert('登録できませんでした。もう一度お試しください。');
      }
    });

    // スキップボタン
    skipBtn.addEventListener('click', () => {
      if (charData) this.saveCapture(gameId, charData, 'ななし');
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        if (onComplete) onComplete();
      }, 300);
    });

    // 表示アニメーション
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  },

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
