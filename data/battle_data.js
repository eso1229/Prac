// 아군 데이터. 이름/수치는 여기서만 고친다.
// pos: 시작 칸 번호 (1이 맨 앞). baseMaxHp: 기본 최대 체력. essences: 런을 시작할 때 장착한 정수 (data/essences.js)
const ALLIES = [
  { name: "가렌", pos: 1, baseMaxHp: 30, essences: ["steel"] },
  { name: "리아", pos: 2, baseMaxHp: 30, essences: ["ironwall"] },
  { name: "토비", pos: 3, baseMaxHp: 30, essences: ["falcon"] },
  { name: "세라", pos: 4, baseMaxHp: 30, essences: [] },
];
// 런을 시작할 때 처음 상태로 되돌리기 위해 시작 값을 기억해 둔다 (run.js의 newRun)
ALLIES.forEach(function (a) { a.startPos = a.pos; a.startEssences = a.essences.slice(); });

// 전투에 나오는 적 (전투를 시작할 때마다 resetBattle이 채운다)
const ENEMIES = [];
