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

function cardText(card) {
  let t = (card.type === "attack" ? "피해 " : "방어도 ") + card.value;
  if (card.push) t += ", 뒤로 " + card.push + "칸";
  return t;
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
  if (card.target === "ally") return ALLIES;
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
  battle.energy = RULES.energyMax;
  battle.moves = 0;
  drawCards();
}

function initBattle() {
  START_DECK.forEach(function (e) {
    for (let i = 0; i < e.count; i++) battle.deck.push({ id: e.id, owner: e.owner });
  });
  shuffle(battle.deck);
  startTurn();
}

function endTurn() {
  battle.discard = battle.discard.concat(battle.hand);
  battle.hand = [];
  startTurn(); // 적 턴은 4단계에서 추가
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
  battle.energy -= card.cost;
  if (card.type === "attack") applyDamage(target, card.value);
  else if (card.type === "block") target.block += card.value;
  if (card.push) pushBack(target, ENEMIES, card.push);
  battle.hand.splice(handIndex, 1);
  battle.discard.push(c);
  return true;
}

// 직접 이동: 바로 옆 칸 아군과 자리 교환
function canMove() {
  return battle.energy >= RULES.moveCost && battle.moves < RULES.moveLimit;
}

function swapAllies(a, b) {
  if (!canMove() || Math.abs(a.pos - b.pos) !== 1) return false;
  const t = a.pos;
  a.pos = b.pos;
  b.pos = t;
  battle.energy -= RULES.moveCost;
  battle.moves++;
  return true;
}
