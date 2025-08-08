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

  // TODO: Google Apps Script のURLに変更
  console.log('送信データ', data);
  alert('ダミー送信完了（コンソールを見てね）');

  board.querySelectorAll('.dot').forEach(n=>n.remove());
  placed = [];
  e.target.reset();
});
