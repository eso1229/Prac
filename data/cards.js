// 카드 데이터. 카드를 추가하려면 CARDS에 한 줄 넣고 START_DECK에 장수를 적는다.
// type: "attack"(피해) / "block"(방어도)
// target: "enemy"(적 한 명) / "self"(소유 캐릭터 자신) / "ally"(아군 한 명)
// usePos: 소유 캐릭터가 서 있어야 하는 칸   hitPos: 타격 가능한 적의 칸
// push: 대상을 뒤로 밀 칸 수 (선택)
const CARDS = {
  slash: { name: "베기", cost: 1, type: "attack", target: "enemy", value: 6, usePos: [1, 2], hitPos: [1, 2] },
  guard: { name: "방패 올리기", cost: 1, type: "block", target: "self", value: 6, usePos: [1, 2, 3] },
  shove: { name: "밀치기", cost: 1, type: "attack", target: "enemy", value: 3, push: 1, usePos: [1, 2], hitPos: [1, 2] },
};

// 임시 덱 (5단계에서 정수가 카드를 주는 방식으로 바뀐다)
// owner: 임시 소유 캐릭터 이름 (battle_data.js의 아군 이름)
const START_DECK = [
  { id: "slash", owner: "가렌", count: 2 },
  { id: "shove", owner: "가렌", count: 1 },
  { id: "slash", owner: "리아", count: 2 },
  { id: "shove", owner: "리아", count: 1 },
  { id: "guard", owner: "토비", count: 2 },
  { id: "guard", owner: "세라", count: 2 },
];
