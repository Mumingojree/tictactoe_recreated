 /* ── CURSOR (pointer devices only) ───────────── */
    const cur  = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    let mx=0,my=0,rx=0,ry=0;
    if(window.matchMedia('(hover:hover)').matches){
      document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
      (function loop(){
        cur.style.left=mx+'px'; cur.style.top=my+'px';
        rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
        ring.style.left=rx+'px'; ring.style.top=ry+'px';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('button,a').forEach(el=>{
        el.addEventListener('mouseenter',()=>{ring.style.width='46px';ring.style.height='46px';});
        el.addEventListener('mouseleave',()=>{ring.style.width='32px';ring.style.height='32px';});
      });
    }

    /* ── CLOCK ────────────────────────────────────── */
    function tick(){document.getElementById('sysTime').textContent=new Date().toTimeString().split(' ')[0];}
    setInterval(tick,1000); tick();

    /* ── GAME STATE ───────────────────────────────── */
    const WIN_PATTERNS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let board=Array(9).fill(''), current='X', gameOver=false, moveCount=0;
    let scores={X:0,O:0,D:0};

    const boardEl=document.getElementById('board');

    function buildBoard(){
      boardEl.innerHTML='';
      for(let i=0;i<9;i++){
        const cell=document.createElement('div');
        cell.className='cell'; cell.dataset.i=i;
        cell.innerHTML=`
          <div class="cell-mark">
            <div class="mark-x" id="mx${i}">
              <svg viewBox="0 0 60 60"><line x1="14" y1="14" x2="46" y2="46"/><line x1="46" y1="14" x2="14" y2="46"/></svg>
            </div>
            <div class="mark-o" id="mo${i}">
              <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="18"/></svg>
            </div>
          </div>`;
        cell.addEventListener('click',()=>play(i));
        /* touch feedback */
        cell.addEventListener('touchstart',()=>{
          if(!gameOver&&!board[i]) cell.style.background='rgba(158,123,90,0.12)';
        },{passive:true});
        cell.addEventListener('touchend',()=>{ cell.style.background=''; },{passive:true});
        boardEl.appendChild(cell);
      }
    }

    function play(i){
      if(gameOver||board[i]) return;
      board[i]=current; moveCount++;
      const cells=boardEl.querySelectorAll('.cell');
      cells[i].classList.add('taken');
      document.getElementById((current==='X'?'mx':'mo')+i).classList.add('show');
      const result=checkWin();
      if(result)       endGame(result);
      else if(moveCount===9) endGame('draw');
      else { current=current==='X'?'O':'X'; updateStatus(); }
    }

    function checkWin(){
      for(const [a,b,c] of WIN_PATTERNS){
        if(board[a]&&board[a]===board[b]&&board[a]===board[c])
          return {winner:board[a],line:[a,b,c]};
      }
      return null;
    }

    function endGame(result){
      gameOver=true;
      const overlay=document.getElementById('resultOverlay');
      const title  =document.getElementById('resultTitle');
      const cells  =boardEl.querySelectorAll('.cell');

      if(result==='draw'){
        scores.D++; bumpScore('numDraw',scores.D);
        title.innerHTML='DRAW<span>—</span>MATCH';
        document.getElementById('resultTag').textContent='STALEMATE DETECTED';
        document.getElementById('resultSub').textContent='NO UNIT DOMINANT';
        setActive('scoreDraw');
        document.getElementById('statusText').innerHTML='DRAW — NO WINNER';
      } else {
        const w=result.winner;
        result.line.forEach(i=>cells[i].classList.add('win-cell'));
        if(w==='X'){ scores.X++; bumpScore('numX',scores.X); setActive('scoreX'); }
        else        { scores.O++; bumpScore('numO',scores.O); setActive('scoreO'); }
        document.getElementById('resultPlayer').textContent=w;
        title.innerHTML=`PLAYER<span>${w}</span>WINS`;
        document.getElementById('resultTag').textContent='UNIT VICTORIOUS';
        document.getElementById('resultSub').textContent='OPPONENT ELIMINATED';
        document.getElementById('statusText').innerHTML=
          `<span class="player-${w.toLowerCase()}">PLAYER ${w}</span> — OVERRIDE`;
      }
      setTimeout(()=>overlay.classList.add('show'),600);
    }

    function updateStatus(){
      document.getElementById('statusText').innerHTML=
        current==='X'
          ? '<span class="player-x">PLAYER X</span> — AWAITING INPUT'
          : '<span class="player-o">PLAYER O</span> — AWAITING INPUT';
      setActive(current==='X'?'scoreX':'scoreO');
    }

    function setActive(id){
      ['scoreX','scoreO','scoreDraw'].forEach(s=>{
        document.getElementById(s).classList.toggle('active-score',s===id);
      });
    }

    function bumpScore(id,val){
      const el=document.getElementById(id);
      el.textContent=val;
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    }

    function newGame(){
      board=Array(9).fill(''); gameOver=false; moveCount=0; current='X';
      document.getElementById('resultOverlay').classList.remove('show');
      buildBoard(); updateStatus();
    }

    function resetGame(){
      scores={X:0,O:0,D:0};
      ['numX','numO','numDraw'].forEach(id=>document.getElementById(id).textContent='0');
      newGame();
    }

    /* Tap overlay to play again */
    document.getElementById('resultOverlay').addEventListener('click',newGame);

    buildBoard(); updateStatus();