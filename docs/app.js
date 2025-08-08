<script>
/** ====== 設定 ====== */
const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwgiP2NGy-WATFWXj3ud-3n__nc4o95cUcdFoqPDSahiLZkQzra-Dr0trkofryhjcU/exec";

/** ====== 状態 ====== */
const board  = document.getElementById('board');
let current  = null;          // 今選んでるオブジェクトID（'A' | 'B' | 'C'）
let placed   = [];            // [{id, x, y}, ...]
let sending  = false;         // 二重送信防止

/** ====== UI: ピックボタン ====== */
document.querySelectorAll('.pick').forEach(btn => {
  btn.addEventListener('click', () => {
    current = btn.dataset.id;
    document.querySelectorAll('.pick')
      .forEach(x => x.classList.toggle('on', x === btn));
  });
});

/** ====== 盤面：クリックで配置 ====== */
const GRID = 36;
const snap = (v) => Math.round(v / GRID) * GRID;

board.addEventListener('click', (e) => {
  if (!current)        return alert('左上のボタンでオブジェクトを選んでね');
  if (placed.length>=3) return alert('配置は3つまで');

  const rect = board.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);

  // 範囲外クリックを無視（見切れ防止）
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

  const dot = document.createElement('div');
  dot.className   = `dot ${current}`;
  dot.textContent = current;
  dot.style.left  = x + 'px';
  dot.style.top   = y + 'px';
  board.appendChild(dot);

  placed.push({ id: current, x, y });
});

/** ====== 送信 ====== */
document.getElementById('fb').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (sending) return;
  if (placed.length !== 3) return alert('3つ置いてから送信してね');

  const fd = new FormData(e.target);
  const payload = {
    who:  fd.get('who'),
    when: fd.get('when'),
    why:  fd.get('why'),
    placements: placed,
    ua: navigator.userAgent,
    ts: Date.now()
  };

  try {
    sending = true;

    // CORSプリフライトを避ける。レスポンスは読まない（opaque）
    await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    alert('送信しました！（シート側で反映を確認してね）');
  } catch (err) {
    console.error(err);
    alert('送信に失敗しました。ネットワーク or 権限設定を確認してね。');
  } finally {
    // 盤面クリア＆フォームリセット
    board.querySelectorAll('.dot').forEach(n => n.remove());
    placed = [];
    e.target.reset();
    document.querySelectorAll('.pick').forEach(x => x.classList.remove('on'));
    current = null;
    sending = false;
  }
});
</script>
