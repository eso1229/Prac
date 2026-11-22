// 전투 기본 수치. 밸런스 수정은 여기서.
const RULES = {
  handSize: 5,   // 턴 시작 시 손패 장수
  energyMax: 3,  // 턴 시작 시 에너지
  restHealPercent: 30, // 휴식 칸에서 회복하는 체력 (최대 체력의 %)
  rewardChoices: 3, // 승리 보상 정수 후보 수
  essenceSlots: 2, // 캐릭터당 정수 장착 칸
  moveCost: 1,   // 직접 이동(인접 아군과 자리 교환) 에너지
  moveLimit: 1,  // 직접 이동 턴당 최대 횟수
  hitWeights: { 1: 40, 2: 30, 3: 20, 4: 10 }, // 적의 단일 대상 공격이 노리는 칸 확률(%)
  enemyActionDelay: 600, // 적이 한 명씩 행동하는 간격(밀리초)
};
