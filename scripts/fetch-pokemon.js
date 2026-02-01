// PokeAPIから全ポケモンの日本語名を取得してJSONファイルに保存するスクリプト
// 実行: node fetch-pokemon.js

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getJapaneseName(speciesId) {
  const url = `${BASE_URL}/pokemon-species/${speciesId}/index.json`;
  const data = await fetch(url);

  // 日本語名を探す（ja が標準日本語、カタカナ表記）
  const jaName = data.names.find(n => n.language.name === 'ja');
  return jaName ? jaName.name : null;
}

async function main() {
  console.log('ポケモンリストを取得中...');

  // 全ポケモン種族のリストを取得
  const speciesIndex = await fetch(`${BASE_URL}/pokemon-species/index.json`);
  const totalCount = speciesIndex.count;
  console.log(`全${totalCount}種類のポケモンを処理します`);

  const pokemonNames = [];
  const batchSize = 50; // 同時リクエスト数

  for (let i = 1; i <= totalCount; i += batchSize) {
    const end = Math.min(i + batchSize - 1, totalCount);
    console.log(`処理中: ${i} - ${end} / ${totalCount}`);

    const promises = [];
    for (let id = i; id <= end; id++) {
      promises.push(
        getJapaneseName(id)
          .then(name => ({ id, name }))
          .catch(() => ({ id, name: null }))
      );
    }

    const results = await Promise.all(promises);
    for (const result of results) {
      if (result.name) {
        pokemonNames.push(result.name);
      }
    }

    // レート制限対策で少し待つ
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n取得完了: ${pokemonNames.length}種類`);

  // JSONファイルに保存
  const output = {
    source: 'PokeAPI (https://github.com/PokeAPI/api-data)',
    updatedAt: new Date().toISOString().split('T')[0],
    count: pokemonNames.length,
    pokemon: pokemonNames
  };

  fs.writeFileSync('pokemon-data.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('pokemon-data.json に保存しました');
}

main().catch(console.error);
