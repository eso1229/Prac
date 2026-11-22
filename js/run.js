// 런(한 판)의 진행 상태: 지도 만들기, 이동, 저장/이어하기. 화면 코드는 mapview.js가 맡는다.
const SAVE_KEY = "darkdeck_run_v1";
const ownedEssences = []; // 이번 런에서 가진 정수 (보상으로 늘어난다)
const run = { map: null, index: {}, current: null, visited: [], inNode: null, pendingReward: null, over: null };

function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function pickWeighted(weights) {
  const keys = Object.keys(weights);
  let total = 0;
  keys.forEach(function (k) { total += weights[k]; });
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[keys[i]];
    if (r < 0) return keys[i];
  }
  return keys[keys.length - 1];
}

// 한 층의 칸들을 다음 층 칸들과 선으로 잇는다 (모든 칸이 이어지도록 보장)
function linkRows(from, to) {
  from.forEach(function (a, i) {
    const j = from.length === 1
      ? Math.round((to.length - 1) / 2)
      : Math.round(i * (to.length - 1) / (from.length - 1));
    const targets = [j];
    if (Math.random() < 0.5) {
      const k = Math.random() < 0.5 ? j - 1 : j + 1;
      if (k >= 0 && k < to.length) targets.push(k);
    }
    targets.forEach(function (k) {
      if (a.next.indexOf(to[k].id) < 0) a.next.push(to[k].id);
    });
  });
  to.forEach(function (b) {
    if (from.some(function (a) { return a.next.indexOf(b.id) >= 0; })) return;
    let best = from[0], bestD = 1e9;
    from.forEach(function (a) {
      const d = Math.abs(a.idx / Math.max(a.count - 1, 1) - b.idx / Math.max(b.count - 1, 1));
      if (d < bestD) { bestD = d; best = a; }
    });
    best.next.push(b.id);
  });
}

function generateMap() {
  const cfg = MAP_CONFIG;
  const acts = [];
  for (let act = 1; act <= cfg.acts; act++) {
    const floors = [];
    for (let f = 1; f <= cfg.floorsPerAct; f++) {
      const n = randInt(cfg.nodesPerFloor[0], cfg.nodesPerFloor[1]);
      const row = [];
      for (let i = 0; i < n; i++) {
        row.push({
          id: "a" + act + "f" + f + "n" + i, act: act, floor: f, idx: i, count: n,
          type: f === 1 ? "battle" : pickWeighted(cfg.typeWeights), next: [], enc: 0,
        });
      }
      floors.push(row);
    }
    const last = floors[floors.length - 1]; // 보스 전 마지막 층에는 휴식이 반드시 있다
    if (!last.some(function (n) { return n.type === "rest"; })) last[randInt(0, last.length - 1)].type = "rest";
    floors.forEach(function (row) {
      row.forEach(function (n) {
        if (n.type !== "rest") n.enc = randInt(0, ENCOUNTERS[n.type].length - 1);
      });
    });
    const boss = { id: "a" + act + "boss", act: act, floor: cfg.floorsPerAct + 1, idx: 0, count: 1, type: "boss", next: [], enc: act - 1 };
    for (let f = 0; f < floors.length - 1; f++) linkRows(floors[f], floors[f + 1]);
    floors[floors.length - 1].forEach(function (n) { n.next.push(boss.id); });
    acts.push({ floors: floors, boss: boss });
  }
  for (let a = 0; a < acts.length - 1; a++) { // 보스를 쓰러뜨리면 다음 막 1층으로
    acts[a].boss.next = acts[a + 1].floors[0].map(function (n) { return n.id; });
  }
  return { acts: acts };
}

function buildIndex() {
  run.index = {};
  run.map.acts.forEach(function (a) {
    a.floors.forEach(function (row) { row.forEach(function (n) { run.index[n.id] = n; }); });
    run.index[a.boss.id] = a.boss;
  });
}

// 새 런: 정수, 아군 체력, 지도를 처음 상태로 만든다
function newRun() {
  ownedEssences.length = 0;
  START_STOCK.forEach(function (id) { ownedEssences.push(id); });
  ALLIES.forEach(function (a) {
    a.essences = a.startEssences.slice();
    a.pos = a.startPos;
    a.maxHp = maxHpOf(a);
    a.hp = a.maxHp;
    a.block = 0;
  });
  run.map = generateMap();
  buildIndex();
  run.current = null;
  run.visited = [];
  run.inNode = null;
  run.pendingReward = null;
  run.over = null;
  saveRun();
}

// 지금 보여줄 막 (보스를 쓰러뜨렸으면 다음 막)
function viewAct() {
  if (!run.current) return 1;
  const n = run.index[run.current];
  return n.type === "boss" ? Math.min(n.act + 1, MAP_CONFIG.acts) : n.act;
}

// 지금 고를 수 있는 칸
function reachableIds() {
  if (!run.current) return run.map.acts[0].floors[0].map(function (n) { return n.id; });
  return run.index[run.current].next.slice();
}

function enterNode(id) {
  run.inNode = id;
  saveRun();
}

// 칸을 끝냈다: 지나온 칸으로 기록한다
function resolveNode() {
  const id = run.inNode;
  run.visited.push(id);
  run.current = id;
  run.inNode = null;
  const n = run.index[id];
  if (n.type === "boss" && n.act === MAP_CONFIG.acts) run.over = "clear";
}

function encounterOf(node) {
  const list = ENCOUNTERS[node.type];
  return list[Math.min(node.enc, list.length - 1)];
}

// 쓰러진 아군(영구 사망)이 끼고 있던 정수는 보관함으로 돌려준다
function retireFallen() {
  ALLIES.forEach(function (a) { if (a.hp <= 0) a.essences = []; });
}

// 생존 아군 체력 회복 (최대 체력의 percent%). 회복한 합계를 돌려준다
function healParty(percent) {
  let total = 0;
  ALLIES.forEach(function (a) {
    if (a.hp <= 0) return;
    const heal = Math.min(a.maxHp - a.hp, Math.ceil(a.maxHp * percent / 100));
    a.hp += heal;
    total += heal;
  });
  return total;
}

// 정수를 바꿔서 최대 체력이 변했을 때: 늘면 현재 체력도 그만큼 늘고, 줄면 최대치로 깎인다
function refreshMaxHp(a) {
  const newMax = maxHpOf(a);
  if (a.hp > 0) a.hp = newMax > a.maxHp ? a.hp + (newMax - a.maxHp) : Math.min(a.hp, newMax);
  a.maxHp = newMax;
}

// ---- 저장 (브라우저 저장소) ----
function saveRun() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1,
      run: { map: run.map, current: run.current, visited: run.visited, inNode: run.inNode, pendingReward: run.pendingReward },
      owned: ownedEssences,
      allies: ALLIES.map(function (a) { return { name: a.name, hp: a.hp, essences: a.essences }; }),
    }));
  } catch (e) { /* 저장소를 못 쓰면 저장 없이 진행한다 */ }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 무시 */ }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

// 저장된 런을 불러온다. 실패하면 false
function loadRun() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s || s.v !== 1 || !s.run || !s.run.map) return false;
    const ok = function (id) { return !!ESSENCES[id]; };
    run.map = s.run.map;
    buildIndex();
    run.current = s.run.current;
    run.visited = s.run.visited || [];
    run.inNode = s.run.inNode;
    run.pendingReward = s.run.pendingReward;
    run.over = null;
    ownedEssences.length = 0;
    (s.owned || []).filter(ok).forEach(function (id) { ownedEssences.push(id); });
    ALLIES.forEach(function (a) {
      const d = (s.allies || []).find(function (x) { return x.name === a.name; });
      a.essences = d ? d.essences.filter(ok) : [];
      a.pos = a.startPos;
      a.maxHp = maxHpOf(a);
      a.hp = d ? Math.max(0, Math.min(d.hp, a.maxHp)) : a.maxHp;
      a.block = 0;
    });
    return true;
  } catch (e) {
    return false;
  }
}
