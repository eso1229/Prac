// 런(한 판)의 지도와 전투 구성. 길이·확률·적 조합은 여기서 고친다.
// 칸 종류: battle(전투) / elite(강한 적) / rest(휴식) / boss(보스).  상점·이벤트는 2차 플랜에서 추가.
const MAP_CONFIG = {
  acts: 3,                       // 막 수
  floorsPerAct: 4,               // 막마다 보스 전 층 수
  nodesPerFloor: [2, 3],         // 층마다 갈림길 칸 수 (최소, 최대)
  typeWeights: { battle: 6, elite: 2, rest: 2 }, // 2층부터 칸 종류 확률 가중치 (1층은 전투만)
  hpMult: [1, 1.25, 1.5],        // 막마다 적 체력 배율
};

// 적 조합: [적 종류, 칸 번호] 목록. 칸 종류마다 여러 개 중 하나가 뽑힌다. (임시)
const ENCOUNTERS = {
  battle: [
    [["skeletonSoldier", 1], ["cultist", 2], ["skeletonArcher", 3]],
    [["skeletonSoldier", 1], ["skeletonSoldier", 2], ["skeletonArcher", 3]],
    [["cultist", 1], ["skeletonArcher", 2], ["skeletonArcher", 3]],
    [["skeletonSoldier", 1], ["cultist", 2]],
  ],
  elite: [
    [["eliteKnight", 1], ["skeletonArcher", 2]],
    [["eliteKnight", 1], ["cultist", 2], ["skeletonArcher", 3]],
  ],
  boss: [ // 막 번호 순서 (1칸 보스, 임시)
    [["fallenKnight", 1]],
    [["fallenKnight", 1]],
    [["fallenKnight", 1]],
  ],
};
