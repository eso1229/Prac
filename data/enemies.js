// 적 데이터. 적을 추가하려면 ENEMY_TYPES에 넣는다.
// pattern: 행동 목록 (순서대로 반복). type: "attack"(단일 대상 피해) / "block"(자기 방어도) / "curse"(아군 2명 자리 교환) / "aoe"(아군 전체 피해)
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
  eliteKnight: {
    name: "해골 기사", maxHp: 30,
    pattern: [
      { type: "attack", name: "베기", value: 8 },
      { type: "block", name: "방패", value: 8 },
      { type: "attack", name: "강타", value: 12 },
    ],
  },
  fallenKnight: { // 보스 (1칸 임시)
    name: "타락한 기사단장", maxHp: 70,
    pattern: [
      { type: "aoe", name: "내려찍기", value: 6 },
      { type: "block", name: "방어", value: 15 },
      { type: "attack", name: "돌진", value: 10 },
    ],
  },
};

// 전투에 세울 적 한 명을 만든다 (hpMult: 막마다 체력 배율)
function spawnEnemy(typeId, pos, hpMult) {
  const t = ENEMY_TYPES[typeId];
  const hp = Math.round(t.maxHp * (hpMult || 1));
  return { name: t.name, pos: pos, hp: hp, maxHp: hp, block: 0, pattern: t.pattern, step: 0 };
}
