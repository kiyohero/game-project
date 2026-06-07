// 診断結果URLシェア機能 - Game Project
// 使い方: <script src="share-result.js" defer></script>

(function () {
  const ShareResult = {
    // 結果データをURLセーフなBase64文字列にエンコード（日本語対応）
    encode(data) {
      return btoa(encodeURIComponent(JSON.stringify(data)).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
    },

    // URLパラメータの文字列をデコードして元のオブジェクトに戻す
    decode(encoded) {
      try {
        return JSON.parse(decodeURIComponent(Array.from(atob(encoded), c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')));
      } catch (e) {
        return null;
      }
    },

    // URLパラメータ ?r=... から結果データを取得（なければ null）
    getFromUrl(paramName) {
      const p = paramName || 'r';
      const encoded = new URLSearchParams(location.search).get(p);
      return encoded ? this.decode(encoded) : null;
    },

    // 結果データを乗せた共有URLを生成
    createUrl(data, paramName) {
      const p = paramName || 'r';
      const url = new URL(location.href);
      url.search = '';
      url.searchParams.set(p, this.encode(data));
      return url.toString();
    },

    // 「結果をシェア」ボタンを生成して container に追加
    // data: シェアしたいオブジェクト
    // options: { label, paramName, className }
    renderShareButton(container, data, options) {
      const opts = options || {};
      const label = opts.label || '🔗 この結果をシェア';
      const paramName = opts.paramName || 'r';
      const url = this.createUrl(data, paramName);

      const btn = document.createElement('button');
      btn.className = opts.className || 'btn share-result-btn';
      btn.style.cssText = 'margin-top:12px; width:100%;';
      btn.textContent = label;

      btn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            btn.textContent = '✅ URLをコピーしました！';
            setTimeout(function () { btn.textContent = label; }, 2500);
          }).catch(function () {
            prompt('URLをコピーしてください', url);
          });
        } else {
          prompt('URLをコピーしてください', url);
        }
      });

      container.appendChild(btn);
      return btn;
    }
  };

  window.ShareResult = ShareResult;
})();
