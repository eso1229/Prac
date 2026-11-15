// 화면 그리기와 입력 처리
// 칸 방향: 적은 왼쪽이 1번, 아군은 오른쪽이 1번 (서로 마주봄)
const SLOT_COUNT = 4;
let selected = null; // 선택한 손패 번호

function targetKind() {
  return selected === null ? null : CARDS[battle.hand[selected]].target;
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
    '<div class="name">' + unit.name + "</div>" +
    '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
    '<div class="stat">체력 ' + unit.hp + "/" + unit.maxHp + "</div>" +
    '<div class="stat block">방어 ' + unit.block + "</div>";
  if (targetKind() === kind) {
    slot.classList.add("targetable");
    slot.onclick = function () {
      playCard(selected, unit);
      selected = null;
      render();
    };
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
  battle.hand.forEach(function (id, i) {
    const card = CARDS[id];
    const el = document.createElement("button");
    el.className = "card " + card.type;
    if (!canPlay(id)) el.classList.add("disabled");
    if (i === selected) el.classList.add("selected");
    el.innerHTML =
      '<div class="cost">' + card.cost + "</div>" +
      '<div class="cname">' + card.name + "</div>" +
      '<div class="ctext">' + cardText(card) + "</div>";
    el.onclick = function () {
      if (!canPlay(id)) return;
      selected = selected === i ? null : i; // 한 번 더 누르면 취소
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
  const msg = document.getElementById("msg");
  if (selected === null) {
    msg.textContent = "카드를 눌러 선택하세요";
  } else {
    const c = CARDS[battle.hand[selected]];
    msg.textContent = c.name + " (" + cardText(c) + ") - " +
      (c.target === "enemy" ? "대상 적을 누르세요" : "대상 아군을 누르세요");
  }
}

document.getElementById("end-turn").onclick = function () {
  selected = null;
  endTurn();
  render();
};

initBattle();
render();
