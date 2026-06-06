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

  isAvailable() {
    return Boolean(window.FirebaseServices && window.FirebaseServices.enabled && window.db);
  },

  getDb() {
    return this.isAvailable() ? window.db : null;
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

  // ランキングモーダルを表示（バイパス中）
  async showRankingModal(gameId, currentScore = null) {},

  // キャプチャを保存
  async saveCapture(gameId, charData, nickname) {
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
      console.error('キャプチャ保存エラー:', error);
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

  // キャプチャ履歴モーダルを表示（バイパス中）
  async showCaptureModal(gameId) {},

  // スコア登録モーダルを表示（バイパス中）
  showSubmitModal(gameId, score, charData, onComplete) {
    if (typeof charData === 'function') onComplete = charData;
    if (typeof onComplete === 'function') onComplete();
  },

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
