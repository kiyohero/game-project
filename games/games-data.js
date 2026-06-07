// 全ゲームの定義。ここに追加するだけでトップページとメニューに反映される
// （isNew: true を付けると、トップの「🆕 しんちゃく」棚にも表示される。古くなったら外す）
window.GAME_PROJECT_CATEGORIES = [
  { id: 'puzzle',  name: 'パズル・あたまの体操',   icon: '🧩' },
  { id: 'battle',  name: 'たいせん・ボードゲーム', icon: '♟️' },
  { id: 'action',  name: 'アクション',             icon: '🎮' },
  { id: 'learn',   name: 'まなび・ことば',         icon: '📚' },
  { id: 'fortune', name: 'うらない・しんだん',     icon: '🔮' },
];
window.GAME_PROJECT_GAMES = [
  { name: '2048',              icon: '🔢', category: 'puzzle',  file: '2048.html' },
  { name: 'お絵かきロジック',    icon: '🎨', category: 'puzzle',  file: 'nonogram.html' },
  { name: 'スライドパズル',      icon: '🖼️', category: 'puzzle',  file: 'sliding-puzzle.html' },
  { name: '神経衰弱',           icon: '🧠', category: 'puzzle',  file: 'memory-game.html' },
  { name: 'クロスワード',        icon: '🔤', category: 'puzzle',  file: 'crossword.html' },
  { name: 'ブロックパズル',      icon: '🧱', category: 'puzzle',  file: 'block-puzzle.html', isNew: true },
  { name: 'マルバツ',           icon: '⭕', category: 'battle',  file: 'tic-tac-toe.html' },
  { name: 'リバーシ',           icon: '⚫', category: 'battle',  file: 'reversi.html' },
  { name: '将棋',              icon: '🏯', category: 'battle',  file: 'shogi.html' },
  { name: 'ババ抜き',           icon: '🃏', category: 'battle',  file: 'old-maid.html' },
  { name: 'HIPO',              icon: '🦛', category: 'battle',  file: 'hipo.html', isNew: true },
  { name: '人狼ゲーム',         icon: '🐺', category: 'battle',  file: 'werewolf.html' },
  { name: 'インベーダー',        icon: '👾', category: 'action',  file: 'invader.html' },
  { name: 'どうぶつ大冒険',      icon: '🐧', category: 'action',  file: 'animal-adventure.html', isNew: true },
  { name: 'ポケモンしりとり',    icon: '⚡', category: 'learn',   file: 'pokemon-shiritori.html' },
  { name: '算術堂へようこそ',    icon: '🏮', category: 'learn',   file: 'arithmetic-game.html' },
  { name: '投資シミュレーター',  icon: '📈', category: 'learn',   file: 'investment-game.html' },
  { name: 'バーコードバトル',    icon: '📱', category: 'learn',   file: 'barcode-battle.html' },
  { name: '手相占い',           icon: '🤚', category: 'fortune', file: 'palm-reading.html' },
  { name: 'パーソナルカラー診断', icon: '💄', category: 'fortune', file: 'personal-color.html', isNew: true },
  { name: '誕生日占い',         icon: '🎂', category: 'fortune', file: 'birthday-fortune.html', isNew: true },
  { name: '相性占い',           icon: '💕', category: 'fortune', file: 'birthday-fortune.html?compat=1', isNew: true },
  { name: 'どうぶつ性格診断', icon: '🦁', category: 'fortune', file: 'mbti-animal.html', isNew: true },
];
