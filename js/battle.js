// 전투 규칙 (덱, 손패, 에너지, 위치, 카드 사용). 화면 그리기는 main.js가 한다.
// 손패/덱의 카드는 { id, owner } 모양이다. (owner = 소유 캐릭터 이름)
const battle = { deck: [], hand: [], discard: [], energy: 0, turn: 0, moves: 0 };

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function rangeText(list) {
  return list.length === 1 ? list[0] : list[0] + "~" + list[list.length - 1];
}

function cardText(card, bonus) {
  let t = (card.type === "attack" ? "피해 " : "방어도 ") + card.value;
  if (bonus) t += "(+" + bonus + ")";
  if (card.push) t += ", 뒤로 " + card.push + "칸";
  if (card.selfPush) t += ", 자신 뒤로 " + card.selfPush + "칸";
  return t;
}

// ---- 정수 특성 ----
function traitsOf(ally) {
  return ally.essences.map(function (id) { return ESSENCES[id].trait; });
}

function maxHpOf(ally) {
  let hp = ally.baseMaxHp;
  traitsOf(ally).forEach(function (t) { if (t.type === "maxHp") hp += t.value; });
  return hp;
}

// 소유 캐릭터가 지금 칸에서 쓰는 공격 카드의 추가 피해
function cardDamageBonus(c) {
  const card = CARDS[c.id];
  if (card.type !== "attack") return 0;
  const owner = allyOf(c.owner);
  let bonus = 0;
  traitsOf(owner).forEach(function (t) {
    if (t.type === "damageBonus" && t.pos.indexOf(owner.pos) >= 0) bonus += t.value;
  });
  return bonus;
}

// 장착한 정수들이 주는 덱 카드 목록
function buildDeckCards() {
  const list = [];
  ALLIES.forEach(function (a) {
    if (a.hp <= 0) return; // 쓰러진 아군(영구 사망)의 카드는 없다
    a.essences.forEach(function (eid) {
      ESSENCES[eid].cards.forEach(function (e) {
        for (let i = 0; i < e.count; i++) list.push({ id: e.id, owner: a.name });
      });
    });
  });
  return list;
}

function allyOf(name) {
  return ALLIES.find(function (a) { return a.name === name; });
}

// 이 카드로 때릴 수 있는 적 (타격 가능 위치 안)
function hitTargets(card) {
  return ENEMIES.filter(function (e) { return card.hitPos.indexOf(e.pos) >= 0; });
}

// 못 쓰는 이유 (쓸 수 있으면 null)
function cannotPlayReason(c) {
  const card = CARDS[c.id];
  const owner = allyOf(c.owner);
  if (owner.hp <= 0) return "쓰러진 캐릭터(" + owner.name + ")의 카드는 쓸 수 없어요";
  if (battle.energy < card.cost) return "에너지가 부족해요";
  if (card.usePos.indexOf(owner.pos) < 0)
    return owner.name + "의 카드는 " + rangeText(card.usePos) + "칸에서만 쓸 수 있어요 (지금 " + owner.pos + "칸)";
  if (card.target === "enemy" && hitTargets(card).length === 0)
    return "적 " + rangeText(card.hitPos) + "칸에 맞출 대상이 없어요";
  return null;
}

function canPlay(c) {
  return cannotPlayReason(c) === null;
}

function validTargets(c) {
  const card = CARDS[c.id];
  if (card.target === "self") return [allyOf(c.owner)];
  if (card.target === "ally") return livingAllies();
  return hitTargets(card);
}

function drawCards() {
  while (battle.hand.length < RULES.handSize) {
    if (battle.deck.length === 0) {
      if (battle.discard.length === 0) break; // 뽑을 카드가 없음
      battle.deck = shuffle(battle.discard); // 버린 카드를 섞어 덱으로
      battle.discard = [];
    }
    battle.hand.push(battle.deck.pop());
  }
}

function startTurn() {
  battle.turn++;
  ALLIES.forEach(function (a) { a.block = 0; }); // 방어도는 아군 턴 시작 때 사라짐
  ALLIES.forEach(function (a) { // 정수 특성: 턴 시작 때 방어도
    if (a.hp <= 0) return;
    traitsOf(a).forEach(function (t) {
      if (t.type === "turnStartBlock" && t.pos.indexOf(a.pos) >= 0) a.block += t.value;
    });
  });
  battle.energy = RULES.energyMax;
  battle.moves = 0;
  drawCards();
}

// 전투를 준비한다 (setup: 적 조합 [[종류, 칸], ...], hpMult: 적 체력 배율)
// 아군 체력은 전투 사이에 회복되지 않으므로 그대로 이어받고, 쓰러진 아군(체력 0)은 나오지 않는다.
function resetBattle(setup, hpMult) {
  battle.deck = buildDeckCards();
  battle.hand = [];
  battle.discard = [];
  battle.turn = 0;
  livingAllies().sort(function (a, b) { return a.startPos - b.startPos; })
    .forEach(function (a, i) { a.pos = i + 1; });
  ALLIES.forEach(function (a) {
    if (a.hp <= 0) a.pos = 0;
    a.maxHp = maxHpOf(a);
    a.block = 0;
  });
  ENEMIES.length = 0;
  setup.forEach(function (s) { ENEMIES.push(spawnEnemy(s[0], s[1], hpMult)); });
  shuffle(battle.deck);
  startTurn();
}

// 아군 턴 종료: 남은 손패를 버린다
function endPlayerTurn() {
  battle.discard = battle.discard.concat(battle.hand);
  battle.hand = [];
}

// ---- 적 ----
function currentIntent(e) {
  return e.pattern[e.step % e.pattern.length];
}

function intentText(e) {
  const a = currentIntent(e);
  if (a.type === "attack") return "⚔ " + a.name + " " + a.value;
  if (a.type === "block") return "🛡 " + a.name + " " + a.value;
  if (a.type === "aoe") return "💥 " + a.name + " " + a.value + " (전체)";
  return "🌀 " + a.name;
}

function livingAllies() {
  return ALLIES.filter(function (a) { return a.hp > 0; });
}

// 칸 번호에 따른 확률로 아군 한 명을 고른다 (쓰러진 아군은 제외하고 비율을 다시 맞춘다)
function pickTarget() {
  const list = livingAllies();
  if (list.length === 0) return null;
  let total = 0;
  list.forEach(function (a) { total += RULES.hitWeights[a.pos]; });
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i++) {
    r -= RULES.hitWeights[list[i].pos];
    if (r < 0) return list[i];
  }
  return list[list.length - 1];
}

function swapPos(a, b) {
  const t = a.pos;
  a.pos = b.pos;
  b.pos = t;
}

// 적 턴이 시작될 때: 적의 방어도가 사라진다
function startEnemyTurn() {
  ENEMIES.forEach(function (e) { e.block = 0; });
}

// 이번 적 턴에 행동할 적 (1번 칸부터)
function actingEnemies() {
  return ENEMIES.filter(function (e) { return e.hp > 0; })
    .sort(function (a, b) { return a.pos - b.pos; });
}

// 적 한 명이 행동하고, 기록 문장을 돌려준다
function enemyAct(e) {
  const a = currentIntent(e);
  e.step++;
  if (a.type === "attack") {
    const t = pickTarget();
    if (!t) return e.name + ": " + a.name + " (대상 없음)";
    applyDamage(t, a.value);
    return e.name + " → " + t.name + " " + a.name + " (피해 " + a.value + ")" + (t.hp <= 0 ? " - " + t.name + " 쓰러짐" : "");
  }
  if (a.type === "block") {
    e.block += a.value;
    return e.name + ": " + a.name + " (방어도 " + a.value + ")";
  }
  if (a.type === "aoe") { // 범위 공격: 피격 편향 없이 아군 전체에게
    const hit = livingAllies();
    hit.forEach(function (t) { applyDamage(t, a.value); });
    const fallen = hit.filter(function (t) { return t.hp <= 0; }).map(function (t) { return t.name; });
    return e.name + ": " + a.name + " (전체 피해 " + a.value + ")" + (fallen.length ? " - " + fallen.join(", ") + " 쓰러짐" : "");
  }
  if (a.type === "curse") {
    const list = shuffle(livingAllies().slice());
    if (list.length < 2) return e.name + ": " + a.name + " (효과 없음)";
    swapPos(list[0], list[1]);
    return e.name + ": " + a.name + " - " + list[0].name + " ↔ " + list[1].name + " 자리 교환";
  }
  return "";
}

function applyDamage(unit, value) {
  const absorbed = Math.min(unit.block, value); // 방어도가 먼저 막는다
  unit.block -= absorbed;
  unit.hp = Math.max(0, unit.hp - (value - absorbed));
}

// 뒤(번호가 큰 쪽)로 민다. 4번 칸이면 이동 없음, 뒤 칸에 유닛이 있으면 자리 교환
function pushBack(unit, list, steps) {
  for (let i = 0; i < steps; i++) {
    if (unit.pos >= 4) break;
    const other = list.find(function (u) { return u.pos === unit.pos + 1; });
    if (other) other.pos = unit.pos;
    unit.pos += 1;
  }
}

function playCard(handIndex, target) {
  const c = battle.hand[handIndex];
  const card = CARDS[c.id];
  if (!canPlay(c) || validTargets(c).indexOf(target) < 0) return false;
  const bonus = cardDamageBonus(c); // 이동하기 전 칸 기준
  battle.energy -= card.cost;
  if (card.type === "attack") applyDamage(target, card.value + bonus);
  else if (card.type === "block") target.block += card.value;
  removeDeadEnemies(); // 쓰러진 적은 사라지고 뒤의 적이 앞으로 당겨진다
  if (card.push && target.hp > 0) pushBack(target, ENEMIES, card.push);
  if (card.selfPush) pushBack(allyOf(c.owner), ALLIES, card.selfPush);
  battle.hand.splice(handIndex, 1);
  battle.discard.push(c);
  return true;
}

// 직접 이동: 바로 옆 칸 아군과 자리 교환
function canMove() {
  return battle.energy >= RULES.moveCost && battle.moves < RULES.moveLimit;
}

function swapAllies(a, b) {
  if (a.hp <= 0 || b.hp <= 0) return false; // 쓰러진 아군과는 자리를 바꿀 수 없다
  if (!canMove() || Math.abs(a.pos - b.pos) !== 1) return false;
  swapPos(a, b);
  battle.energy -= RULES.moveCost;
  battle.moves++;
  return true;
}

// ---- 쓰러짐과 승패 ----
// 쓰러진 적을 없애고, 남은 적을 앞칸부터 채운다
function removeDeadEnemies() {
  for (let i = ENEMIES.length - 1; i >= 0; i--) {
    if (ENEMIES[i].hp <= 0) ENEMIES.splice(i, 1);
  }
  ENEMIES.sort(function (a, b) { return a.pos - b.pos; });
  ENEMIES.forEach(function (e, i) { e.pos = i + 1; });
}

// 쓰러진 아군은 전장에서 빠지고(칸 0), 그 아군의 카드는 덱·손패·버린 더미에서 사라진다.
// 남은 아군은 앞칸부터 당겨진다.
function removeDeadAllies() {
  ALLIES.forEach(function (a) {
    if (a.hp <= 0 && a.pos > 0) {
      a.pos = 0;
      ["deck", "hand", "discard"].forEach(function (k) {
        battle[k] = battle[k].filter(function (c) { return c.owner !== a.name; });
      });
    }
  });
  livingAllies().sort(function (a, b) { return a.pos - b.pos; })
    .forEach(function (a, i) { a.pos = i + 1; });
}

// 전투가 끝났는지: "win"(적 전멸) / "lose"(아군 전멸) / null(계속)
function checkBattleEnd() {
  if (ENEMIES.length === 0) return "win";
  if (livingAllies().length === 0) return "lose";
  return null;
}


