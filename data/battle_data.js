// 임시 전투 데이터 (1단계용). 이름/수치는 여기서만 고친다.
// pos: 칸 번호 (1이 맨 앞). hp = 현재 체력, maxHp = 최대 체력.
const ALLIES = [
  { name: "가렌", pos: 1, hp: 30, maxHp: 30, block: 0 },
  { name: "리아", pos: 2, hp: 30, maxHp: 30, block: 0 },
  { name: "토비", pos: 3, hp: 22, maxHp: 30, block: 0 },
  { name: "세라", pos: 4, hp: 30, maxHp: 30, block: 0 },
];

// 적은 data/enemies.js의 종류와 칸 번호로 만든다
const ENEMIES = [
  spawnEnemy("skeletonSoldier", 1),
  spawnEnemy("cultist", 2),
  spawnEnemy("skeletonArcher", 3),
];
