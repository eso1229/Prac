// 임시 전투 데이터. 이름/수치는 여기서만 고친다.
// pos: 칸 번호 (1이 맨 앞). baseMaxHp: 기본 최대 체력. essences: 처음 장착한 정수 (data/essences.js)
const ALLIES = [
  { name: "가렌", pos: 1, baseMaxHp: 30, essences: ["steel"] },
  { name: "리아", pos: 2, baseMaxHp: 30, essences: ["ironwall"] },
  { name: "토비", pos: 3, baseMaxHp: 30, essences: ["falcon"] },
  { name: "세라", pos: 4, baseMaxHp: 30, essences: [] },
];
// 전투를 시작할 때마다 시작 칸, 체력, 방어도를 되돌린다 (resetBattle)
ALLIES.forEach(function (a) { a.startPos = a.pos; a.maxHp = a.baseMaxHp; a.hp = a.baseMaxHp; a.block = 0; });

// 적은 data/enemies.js의 종류와 칸 번호로 만든다
const ENEMY_SETUP = [["skeletonSoldier", 1], ["cultist", 2], ["skeletonArcher", 3]];
const ENEMIES = [];
