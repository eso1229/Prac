// 카드 데이터. 카드를 추가하려면 CARDS에 한 줄 넣고 START_DECK에 장수를 적는다.
// type: "attack"(피해) / "block"(방어도)   target: "enemy" / "ally"
const CARDS = {
  slash: { name: "베기", cost: 1, type: "attack", target: "enemy", value: 6 },
  guard: { name: "방패 올리기", cost: 1, type: "block", target: "ally", value: 6 },
};

// 2단계 임시 덱 (카드 id: 장수)
const START_DECK = { slash: 5, guard: 5 };
