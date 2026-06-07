// GitHub Contents API ベース 汎用データベース基盤 - Game Project
//
// GithubDB は GitHub Contents API を使って、JSONファイルを
// データストアとして読み書きする共通ユーティリティです。
// 設定は window.GithubDBConfig（github-config.js がセット）から読みます。

(function () {
  'use strict';

  // --- Base64 ユーティリティ（日本語対応）---

  function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function decodeBase64(b64) {
    return decodeURIComponent(escape(atob(b64)));
  }

  // --- ランダムウェイト（SHA競合リトライ用）---

  function randomWait(minMs, maxMs) {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // --- コア API ---

  const GithubDB = {

    /**
     * GithubDB が使用可能な設定を持っているか確認する
     * @returns {boolean}
     */
    isConfigured() {
      const cfg = window.GithubDBConfig;
      return Boolean(cfg && cfg.token && cfg.owner && cfg.repo);
    },

    /**
     * 設定オブジェクトを返す（未設定時は null）
     * @returns {{token: string, owner: string, repo: string}|null}
     */
    _getConfig() {
      return this.isConfigured() ? window.GithubDBConfig : null;
    },

    /**
     * GitHub Contents API の URL を構築する
     * @param {string} filename - リポジトリ内のパス（例: "rankings/invader.json"）
     * @returns {string}
     */
    _buildUrl(filename) {
      const cfg = this._getConfig();
      return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filename}`;
    },

    /**
     * リポジトリ上のファイルを読み込む
     * @param {string} filename - リポジトリ内のパス
     * @returns {Promise<{data: any, sha: string}|{data: null, sha: null}>}
     *          404 の場合は data: null, sha: null を返す
     */
    async readFile(filename) {
      if (!this.isConfigured()) return { data: null, sha: null };
      const cfg = this._getConfig();
      try {
        const res = await fetch(this._buildUrl(filename), {
          headers: {
            'Authorization': `token ${cfg.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (res.status === 404) {
          return { data: null, sha: null };
        }

        if (!res.ok) {
          console.warn(`[GithubDB] readFile failed (${res.status}):`, filename);
          return { data: null, sha: null };
        }

        const json = await res.json();
        // content フィールドは改行込みの Base64
        const raw = decodeBase64(json.content.replace(/\n/g, ''));
        const data = JSON.parse(raw);
        return { data, sha: json.sha };
      } catch (err) {
        console.warn('[GithubDB] readFile error:', err);
        return { data: null, sha: null };
      }
    },

    /**
     * リポジトリ上のファイルに書き込む（作成 or 更新）
     * @param {string} filename - リポジトリ内のパス
     * @param {any} data - 書き込む値（JSON シリアライズされる）
     * @param {string|null} sha - 更新時は既存の SHA、新規作成時は null
     * @returns {Promise<boolean>} 成功なら true
     */
    async writeFile(filename, data, sha) {
      if (!this.isConfigured()) return false;
      const cfg = this._getConfig();
      try {
        const content = encodeBase64(JSON.stringify(data, null, 2));
        const body = {
          message: `update ${filename}`,
          content
        };
        if (sha) body.sha = sha;

        const res = await fetch(this._buildUrl(filename), {
          method: 'PUT',
          headers: {
            'Authorization': `token ${cfg.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          console.warn(`[GithubDB] writeFile failed (${res.status}):`, filename);
          return false;
        }

        return true;
      } catch (err) {
        console.warn('[GithubDB] writeFile error:', err);
        return false;
      }
    },

    /**
     * 配列 JSON ファイルに item を追加する。SHA 競合（409）は自動リトライ（最大3回）。
     * @param {string} filename - リポジトリ内のパス（例: "rankings/invader.json"）
     * @param {object} item - 追加するオブジェクト
     * @param {{maxItems?: number, orderBy?: string|null, order?: 'asc'|'desc'}} options
     * @returns {Promise<boolean>} 成功なら true
     */
    async addToCollection(filename, item, options) {
      if (!this.isConfigured()) return false;
      const opts = Object.assign({ maxItems: 100, orderBy: null, order: 'desc' }, options || {});

      const MAX_RETRY = 3;
      for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
        if (attempt > 0) {
          await randomWait(300, 700);
        }

        try {
          // 1. 現在のファイルを読み込む
          const { data: current, sha } = await this.readFile(filename);
          const list = Array.isArray(current) ? current : [];

          // 2. タイムスタンプを自動付与
          const newItem = Object.assign({ _ts: Date.now() }, item);

          // 3. 末尾に追加
          list.push(newItem);

          // 4. ソート
          if (opts.orderBy) {
            const field = opts.orderBy;
            const asc = opts.order === 'asc' ? 1 : -1;
            list.sort(function (a, b) {
              if (a[field] < b[field]) return -1 * asc;
              if (a[field] > b[field]) return 1 * asc;
              return 0;
            });
            // desc の場合: 大きい順（後で reverse ではなく sort の asc=-1 で対応済み）
          }

          // 5. 上限を超えた分を切り捨て
          const trimmed = list.slice(0, opts.maxItems);

          // 6. 書き込み
          const cfg = this._getConfig();
          const content = encodeBase64(JSON.stringify(trimmed, null, 2));
          const body = {
            message: `update ${filename}`,
            content
          };
          if (sha) body.sha = sha;

          const res = await fetch(this._buildUrl(filename), {
            method: 'PUT',
            headers: {
              'Authorization': `token ${cfg.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (res.status === 409) {
            // SHA 競合 → リトライ
            console.warn(`[GithubDB] addToCollection SHA conflict, retry ${attempt + 1}/${MAX_RETRY}`);
            continue;
          }

          if (!res.ok) {
            console.warn(`[GithubDB] addToCollection failed (${res.status}):`, filename);
            return false;
          }

          return true;
        } catch (err) {
          console.warn('[GithubDB] addToCollection error:', err);
          return false;
        }
      }

      console.warn('[GithubDB] addToCollection: max retries exceeded for', filename);
      return false;
    },

    /**
     * 配列 JSON ファイルを取得して配列を返す
     * @param {string} filename - リポジトリ内のパス
     * @returns {Promise<Array>} データ配列（ファイルがなければ空配列）
     */
    async getCollection(filename) {
      if (!this.isConfigured()) return [];
      try {
        const { data } = await this.readFile(filename);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('[GithubDB] getCollection error:', err);
        return [];
      }
    },

    /**
     * オブジェクト JSON ファイルの特定キーに値をセットする。SHA 競合は自動リトライ（最大3回）。
     * @param {string} filename - リポジトリ内のパス
     * @param {string} key - セットするキー
     * @param {any} value - セットする値
     * @returns {Promise<boolean>} 成功なら true
     */
    async setDocument(filename, key, value) {
      if (!this.isConfigured()) return false;

      const MAX_RETRY = 3;
      for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
        if (attempt > 0) {
          await randomWait(300, 700);
        }

        try {
          const { data: current, sha } = await this.readFile(filename);
          const doc = (current && typeof current === 'object' && !Array.isArray(current))
            ? current
            : {};

          doc[key] = value;

          const cfg = this._getConfig();
          const content = encodeBase64(JSON.stringify(doc, null, 2));
          const body = {
            message: `update ${filename}`,
            content
          };
          if (sha) body.sha = sha;

          const res = await fetch(this._buildUrl(filename), {
            method: 'PUT',
            headers: {
              'Authorization': `token ${cfg.token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (res.status === 409) {
            console.warn(`[GithubDB] setDocument SHA conflict, retry ${attempt + 1}/${MAX_RETRY}`);
            continue;
          }

          if (!res.ok) {
            console.warn(`[GithubDB] setDocument failed (${res.status}):`, filename);
            return false;
          }

          return true;
        } catch (err) {
          console.warn('[GithubDB] setDocument error:', err);
          return false;
        }
      }

      console.warn('[GithubDB] setDocument: max retries exceeded for', filename);
      return false;
    },

    /**
     * オブジェクト JSON ファイルの値を取得する
     * @param {string} filename - リポジトリ内のパス
     * @param {string|null} key - 取得するキー。null なら全体を返す
     * @returns {Promise<any>} 値（ファイルやキーがなければ null）
     */
    async getDocument(filename, key) {
      if (!this.isConfigured()) return null;
      try {
        const { data } = await this.readFile(filename);
        if (data === null) return null;
        if (key === null || key === undefined) return data;
        return (data && typeof data === 'object') ? (data[key] !== undefined ? data[key] : null) : null;
      } catch (err) {
        console.warn('[GithubDB] getDocument error:', err);
        return null;
      }
    }
  };

  window.GithubDB = GithubDB;
})();
