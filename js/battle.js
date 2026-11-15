// 전투 규칙 (덱, 손패, 에너지, 카드 사용). 화면 그리기는 main.js가 한다.
const battle = { deck: [], hand: [], discard: [], energy: 0, turn: 0 };

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function cardText(card) {
  return (card.type === "attack" ? "피해 " : "방어도 ") + card.value;
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
  drawCards();
}

function initBattle() {
  Object.keys(START_DECK).forEach(function (id) {
    for (let i = 0; i < START_DECK[id]; i++) battle.deck.push(id);
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

function canPlay(cardId) {
  return battle.energy >= CARDS[cardId].cost;
}

function playCard(handIndex, target) {
  const id = battle.hand[handIndex];
  const card = CARDS[id];
  if (!canPlay(id)) return false;
  battle.energy -= card.cost;
  if (card.type === "attack") applyDamage(target, card.value);
  else if (card.type === "block") target.block += card.value;
  battle.hand.splice(handIndex, 1);
  battle.discard.push(id);
  return true;
}
