// ランキング機能 - Game Project

const Ranking = {
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

  // スコア登録モーダルを表示
  showSubmitModal(gameId, score, onComplete) {
    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('submitModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'ranking-modal';
    modal.id = 'submitModal';
    modal.innerHTML = `
      <div class="ranking-content">
        <h3>🎉 スコア: ${score.toLocaleString()}</h3>
        <div class="submit-area">
          <p>ランキングに登録する？</p>
          <input type="text" id="submitNickname" placeholder="ニックネーム（なくてもOK）" maxlength="10">
          <div class="submit-buttons">
            <button class="btn" id="submitBtn">登録する</button>
            <button class="btn secondary" id="skipBtn">スキップ</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const nicknameInput = modal.querySelector('#submitNickname');
    const submitBtn = modal.querySelector('#submitBtn');
    const skipBtn = modal.querySelector('#skipBtn');
    const submitArea = modal.querySelector('.submit-area');

    // 登録ボタン
    submitBtn.addEventListener('click', async () => {
      submitBtn.disabled = true;
      submitBtn.textContent = '登録中...';

      const nickname = nicknameInput.value;
      const success = await this.submitScore(gameId, score, nickname);

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
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        if (onComplete) onComplete();
      }, 300);
    });

    // 表示アニメーション
    requestAnimationFrame(() => {
      modal.classList.add('show');
      nicknameInput.focus();
    });
  },

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
