// 정수 데이터. 정수를 추가하려면 ESSENCES에 넣는다.
// trait(특성): type "maxHp"(최대 체력 +value) / "damageBonus"(pos 칸에서 쓰는 공격 카드 피해 +value) /
//              "turnStartBlock"(pos 칸에 있으면 턴 시작 때 방어도 +value)
// cards: 장착하면 받는 카드 (id: 카드 종류, count: 장수)
const ESSENCES = {
  steel: {
    name: "강철의 정수",
    text: "최대 체력 +8",
    trait: { type: "maxHp", value: 8 },
    cards: [{ id: "slash", count: 2 }, { id: "guard", count: 1 }],
  },
  falcon: {
    name: "매의 정수",
    text: "3~4칸에서 쓰는 공격 카드 피해 +1",
    trait: { type: "damageBonus", pos: [3, 4], value: 1 },
    cards: [{ id: "aim", count: 2 }, { id: "retreat", count: 1 }],
  },
  ironwall: {
    name: "철벽의 정수",
    text: "1칸에 있으면 턴 시작 때 방어도 +2",
    trait: { type: "turnStartBlock", pos: [1], value: 2 },
    cards: [{ id: "guard", count: 2 }, { id: "shove", count: 1 }],
  },
};

// 시작할 때 가진 정수 (같은 종류를 여러 개 적으면 여러 개 가진다)
const START_STOCK = ["steel", "falcon", "ironwall"];
