// 카드 데이터. 카드를 추가하려면 CARDS에 한 줄 넣는다. 카드는 정수가 준다 (data/essences.js).
// type: "attack"(피해) / "block"(방어도)
// target: "enemy"(적 한 명) / "self"(소유 캐릭터 자신) / "ally"(아군 한 명)
// usePos: 소유 캐릭터가 서 있어야 하는 칸   hitPos: 타격 가능한 적의 칸
// push: 대상을 뒤로 밀 칸 수 (선택)   selfPush: 소유 캐릭터가 뒤로 이동할 칸 수 (선택)
// 카드는 정수가 준다 (data/essences.js)
const CARDS = {
  slash: { name: "베기", cost: 1, type: "attack", target: "enemy", value: 6, usePos: [1, 2], hitPos: [1, 2] },
  guard: { name: "방패 올리기", cost: 1, type: "block", target: "self", value: 6, usePos: [1, 2, 3] },
  shove: { name: "밀치기", cost: 1, type: "attack", target: "enemy", value: 3, push: 1, usePos: [1, 2], hitPos: [1, 2] },
  aim: { name: "조준 사격", cost: 1, type: "attack", target: "enemy", value: 5, usePos: [3, 4], hitPos: [1, 2, 3, 4] },
  retreat: { name: "후퇴", cost: 0, type: "block", target: "self", value: 3, selfPush: 1, usePos: [1, 2, 3] },
};
