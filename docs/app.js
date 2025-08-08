const ENDPOINT = "https://script.google.com/macros/s/AKfycbwgiP2NGy-WATFWXj3ud-3n__nc4o95cUcdFoqPDSahiLZkQzra-Dr0trkofryhjcU/exec";
const board = document.getElementById('board');
let current = null;
let placed = []; // {id,x,y}

document.querySelectorAll('.pick').forEach(b=>{
  b.addEventListener('click', ()=>{
    current = b.dataset.id;
    document.querySelectorAll('.pick').forEach(x=>x.classList.toggle('on', x===b));
  });
});

function snap(v, g=36){ return Math.round(v/g)*g; }

board.addEventListener('click', e=>{
  if(!current) return alert('左上のボタンでオブジェクトを選んでね');
  if(placed.length>=3) return alert('配置は3つまで');
  const rect = board.getBoundingClientRect();
  const x = snap(e.clientX-rect.left);
  const y = snap(e.clientY-rect.top);

  const d = document.createElement('div');
  d.className = `dot ${current}`;
  d.textContent = current;
  d.style.left = x+'px';
  d.style.top  = y+'px';
  board.appendChild(d);

  placed.push({id:current, x, y});
});

document.getElementById('fb').addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(placed.length!==3) return alert('3つ置いてから送信してね');

  const data = Object.fromEntries(new FormData(e.target).entries());
  data.placed = placed;

try {
  // 送るデータを整形（フォーム値 + 配置 + UA）
  const payload = {
    ...data,                 // who/when/why
    placements: placed,      // 配置点（Apps Script 側で読むキー）
    ua: navigator.userAgent, // 端末情報（任意）
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    // プリフライト回避のため text/plain で送る（Apps Script 側もそれ前提で実装済み）
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok !== true) throw new Error('send failed');

  alert('送信しました！');
} catch (err) {
  console.error(err);
  alert('送信に失敗しました。ネットワーク or 権限設定を確認してね。');
} finally {
  // 盤面クリア＆フォームリセット
  board.querySelectorAll('.dot').forEach(n => n.remove());
  placed = [];
  e.target.reset();
}

  alert('ダミー送信完了（コンソールを見てね）');

  board.querySelectorAll('.dot').forEach(n=>n.remove());
  placed = [];
  e.target.reset();
});
