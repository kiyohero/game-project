#!/usr/bin/env python3
"""
PokeAPIから全ポケモンの日本語名を取得してJSONファイルに保存するスクリプト
実行: python3 fetch-pokemon.py
"""

import json
import urllib.request
from datetime import datetime
import time
import sys

BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2'

def fetch_json(url):
    """URLからJSONを取得"""
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))

def get_pokemon_info(species_id):
    """指定IDのポケモンの日本語名とIDを取得"""
    url = f'{BASE_URL}/pokemon-species/{species_id}/index.json'
    try:
        data = fetch_json(url)
        # 日本語名を探す（ja が標準日本語、カタカナ表記）
        for name_entry in data.get('names', []):
            if name_entry.get('language', {}).get('name') == 'ja':
                return {'id': species_id, 'name': name_entry.get('name')}
    except Exception as e:
        print(f'  警告: ID {species_id} の取得に失敗: {e}', file=sys.stderr)
    return None

def main():
    print('ポケモンリストを取得中...')

    # 全ポケモン種族のリストを取得
    species_index = fetch_json(f'{BASE_URL}/pokemon-species/index.json')
    total_count = species_index['count']
    print(f'全{total_count}種類のポケモンを処理します')

    pokemon_list = []

    for species_id in range(1, total_count + 1):
        if species_id % 50 == 1:
            end = min(species_id + 49, total_count)
            print(f'処理中: {species_id} - {end} / {total_count}')

        info = get_pokemon_info(species_id)
        if info:
            pokemon_list.append(info)

        # レート制限対策
        if species_id % 10 == 0:
            time.sleep(0.05)

    print(f'\n取得完了: {len(pokemon_list)}種類')

    # JSONファイルに保存
    output = {
        'source': 'PokeAPI (https://github.com/PokeAPI/api-data)',
        'spriteUrl': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png',
        'updatedAt': datetime.now().strftime('%Y-%m-%d'),
        'count': len(pokemon_list),
        'pokemon': pokemon_list
    }

    with open('pokemon-data.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print('pokemon-data.json に保存しました')

if __name__ == '__main__':
    main()
