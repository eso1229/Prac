// 화면 그리기와 입력 처리
// 칸 방향: 적은 왼쪽이 1번, 아군은 오른쪽이 1번 (서로 마주봄)
const SLOT_COUNT = 4;
let selected = null;   // 선택한 손패 번호
let moveMode = false;  // 직접 이동 중인지
let moveFrom = null;   // 이동할 아군 (첫 번째로 고른 아군)
let notice = "";       // 안내 문구 (못 쓰는 이유 등)
let busy = false;      // 적 턴 진행 중이면 입력을 막는다
const logLines = [];   // 전투 기록

function cancelAll() {
  selected = null;
  moveMode = false;
  moveFrom = null;
  notice = "";
}

// 지금 이 유닛을 누를 수 있는가? 누르면 실행할 함수를 돌려준다
function slotAction(unit, kind) {
  if (busy) return null;
  if (selected !== null) {
    const c = battle.hand[selected];
    if (validTargets(c).indexOf(unit) >= 0) {
      return function () { playCard(selected, unit); cancelAll(); };
    }
    return null;
  }
  if (moveMode && kind === "ally" && unit.hp > 0) {
    if (moveFrom === null) {
      return function () { moveFrom = unit; };
    }
    if (unit === moveFrom) {
      return function () { moveFrom = null; };
    }
    if (Math.abs(unit.pos - moveFrom.pos) === 1) {
      return function () { swapAllies(moveFrom, unit); cancelAll(); };
    }
  }
  return null;
}

function makeSlot(unit, pos, kind) {
  const slot = document.createElement("div");
  slot.className = "slot";
  slot.dataset.pos = pos;
  const num = '<div class="pos">' + pos + "</div>";
  if (!unit) {
    slot.classList.add("hidden"); // 빈 칸은 숨김
    slot.innerHTML = num;
    return slot;
  }
  const pct = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  slot.innerHTML =
    num +
    (kind === "enemy" && unit.hp > 0 ? '<div class="intent">' + intentText(unit) + "</div>" : "") +
    '<div class="name">' + unit.name + "</div>" +
    '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
    '<div class="stat">체력 ' + unit.hp + "/" + unit.maxHp + "</div>" +
    '<div class="stat block">방어 ' + unit.block + "</div>";
  if (unit === moveFrom) slot.classList.add("move-from");
  const action = slotAction(unit, kind);
  if (action) {
    slot.classList.add("targetable");
    slot.onclick = function () { action(); afterAction(); };
  }
  return slot;
}

function renderRow(rowId, units, kind, reverse) {
  const row = document.getElementById(rowId);
  row.innerHTML = "";
  const order = [];
  for (let p = 1; p <= SLOT_COUNT; p++) order.push(p);
  if (reverse) order.reverse(); // 아군: 4,3,2,1 순서로 그려서 1번이 오른쪽
  order.forEach(function (p) {
    const unit = units.find(function (u) { return u.pos === p; });
    row.appendChild(makeSlot(unit, p, kind));
  });
}

function renderHand() {
  const hand = document.getElementById("hand");
  hand.innerHTML = "";
  battle.hand.forEach(function (c, i) {
    const card = CARDS[c.id];
    const reason = cannotPlayReason(c);
    const el = document.createElement("button");
    el.className = "card " + card.type;
    if (reason) el.classList.add("disabled");
    if (i === selected) el.classList.add("selected");
    el.innerHTML =
      '<div class="cost">' + card.cost + "</div>" +
      '<div class="cowner">' + c.owner + " " + rangeText(card.usePos) + "칸</div>" +
      '<div class="cname">' + card.name + "</div>" +
      '<div class="ctext">' + cardText(card, cardDamageBonus(c)) + "</div>";
    el.onclick = function () {
      if (busy) return;
      if (reason) { // 못 쓰는 카드는 이유만 보여준다
        cancelAll();
        notice = reason;
      } else if (i === selected) {
        cancelAll(); // 한 번 더 누르면 취소
      } else {
        cancelAll();
        selected = i;
      }
      render();
    };
    hand.appendChild(el);
  });
}

function render() {
  renderRow("enemy-row", ENEMIES, "enemy", false);
  renderRow("ally-row", ALLIES, "ally", true);
  renderHand();
  document.getElementById("energy").textContent =
    "에너지 " + battle.energy + "/" + RULES.energyMax;
  document.getElementById("piles").textContent =
    "덱 " + battle.deck.length + " · 버림 " + battle.discard.length + " · 턴 " + battle.turn;
  const moveBtn = document.getElementById("move");
  moveBtn.textContent = "이동 (" + RULES.moveCost + ")";
  moveBtn.disabled = busy || !canMove();
  document.getElementById("end-turn").disabled = busy;
  document.getElementById("log").innerHTML = logLines.slice(-2).join("<br>");
  moveBtn.classList.toggle("active", moveMode);

  const msg = document.getElementById("msg");
  if (busy) {
    msg.textContent = "적의 턴...";
  } else if (notice) {
    msg.textContent = notice;
  } else if (selected !== null) {
    const c = battle.hand[selected];
    const card = CARDS[c.id];
    const who = card.target === "self" ? "빛나는 " + c.owner + " 칸을 누르세요" : "대상 적을 누르세요";
    msg.textContent = card.name + " (" + cardText(card, cardDamageBonus(c)) + ") - " + who;
  } else if (moveMode) {
    msg.textContent = moveFrom === null
      ? "자리를 바꿀 아군을 누르세요"
      : "(" + moveFrom.name + ") 바꿀 옆 칸 아군을 누르세요";
  } else {
    msg.textContent = "카드를 눌러 선택하세요";
  }
}

// 행동 뒤에: 쓰러진 유닛을 정리하고 화면을 새로 그린 뒤, 전투가 끝났으면 결과 화면을 띄운다
function afterAction() {
  removeDeadEnemies();
  removeDeadAllies();
  const r = checkBattleEnd();
  if (r) {
    busy = true;
    cancelAll();
  }
  render();
  if (r) showResult(r);
  return !!r;
}

// 적 턴: 1번 칸 적부터 한 명씩 행동하고, 끝나면 아군 턴을 시작한다
function runEnemyTurn() {
  busy = true;
  startEnemyTurn();
  const queue = actingEnemies();
  render();
  function next() {
    if (queue.length === 0) {
      startTurn();
      busy = false;
      logLines.push("--- 턴 " + battle.turn + " ---");
      render();
      return;
    }
    const e = queue.shift();
    if (e.hp > 0) logLines.push(enemyAct(e));
    if (afterAction()) return; // 아군 전멸이면 적 턴을 멈춘다
    setTimeout(next, RULES.enemyActionDelay);
  }
  setTimeout(next, RULES.enemyActionDelay);
}

document.getElementById("end-turn").onclick = function () {
  if (busy) return;
  cancelAll();
  endPlayerTurn();
  runEnemyTurn();
};

document.getElementById("move").onclick = function () {
  if (busy) return;
  const wasOn = moveMode;
  cancelAll();
  moveMode = !wasOn && canMove();
  render();
};

// 정비 화면 <-> 전투 화면
function startBattle() {
  cancelAll();
  logLines.length = 0;
  busy = false;
  resetBattle();
  document.getElementById("camp").hidden = true;
  document.getElementById("game").hidden = false;
  render();
}

showCamp();
