// 적 데이터. 적을 추가하려면 ENEMY_TYPES에 넣는다.
// pattern: 행동 목록 (순서대로 반복). type: "attack"(단일 대상 피해) / "block"(자기 방어도) / "curse"(아군 2명 자리 교환)
const ENEMY_TYPES = {
  skeletonSoldier: {
    name: "해골 병사", maxHp: 18,
    pattern: [
      { type: "attack", name: "베기", value: 6 },
      { type: "block", name: "방패", value: 6 },
    ],
  },
  skeletonArcher: {
    name: "해골 궁수", maxHp: 12,
    pattern: [{ type: "attack", name: "사격", value: 5 }],
  },
  cultist: {
    name: "광신도", maxHp: 14,
    pattern: [
      { type: "curse", name: "저주" },
      { type: "attack", name: "베기", value: 4 },
    ],
  },
};

// 전투에 세울 적 한 명을 만든다
function spawnEnemy(typeId, pos) {
  const t = ENEMY_TYPES[typeId];
  return { name: t.name, pos: pos, hp: t.maxHp, maxHp: t.maxHp, block: 0, pattern: t.pattern, step: 0 };
}
