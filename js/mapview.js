// 시작 화면과 지도 화면 (그리기와 입력)
const NODE_ICON = { battle: "⚔", elite: "☠", rest: "🔥", boss: "👑" };
const NODE_NAME = { battle: "전투", elite: "강적", rest: "휴식", boss: "보스" };

function showTitle() {
  showScreen("title");
  const root = document.getElementById("title");
  root.innerHTML = '<h2>어두운 중세 덱빌딩 RPG</h2><div class="cempty">정수를 모아 파티를 키우고 보스를 쓰러뜨리세요</div>';
  if (hasSave()) {
    const b = document.createElement("button");
    b.className = "end-turn cstart";
    b.textContent = "이어하기";
    b.onclick = function () { if (loadRun()) resumeRun(); else startNewRun(); };
    root.appendChild(b);
  }
  const n = document.createElement("button");
  n.className = "end-turn cstart";
  n.textContent = "새 런 시작";
  n.onclick = startNewRun;
  root.appendChild(n);
}

// 저장된 런을 이어서 시작한다 (전투 도중에 끝냈다면 그 전투를 처음부터 다시 한다)
function resumeRun() {
  if (run.pendingReward) {
    showMap();
    showResult("win");
  } else if (run.inNode) {
    startNode(run.inNode);
  } else {
    showMap();
  }
}

// 지도에서 칸을 눌렀을 때
function startNode(id) {
  const n = run.index[id];
  if (n.type === "rest") {
    enterNode(id);
    resolveNode();
    const healed = healParty(RULES.restHealPercent);
    saveRun();
    showMap();
    showRest(healed);
    return;
  }
  enterNode(id);
  startBattle(encounterOf(n), MAP_CONFIG.hpMult[n.act - 1]);
}

function showRest(healed) {
  const box = document.getElementById("result");
  box.innerHTML = '<div class="popup"><h3>휴식</h3><div class="ptrait">생존한 아군의 체력을 ' +
    RULES.restHealPercent + "% 회복했어요 (합계 +" + healed + ')</div>' +
    '<button class="punequip" id="rest-camp">정비 화면 (정수 장착)</button>' +
    '<button class="rchoice rest-go" id="rest-go">맵으로</button></div>';
  box.hidden = false;
  document.getElementById("rest-camp").onclick = showCamp;
  document.getElementById("rest-go").onclick = function () { box.hidden = true; };
}

function showMap() {
  showScreen("map");
  const root = document.getElementById("map");
  const act = viewAct();
  const data = run.map.acts[act - 1];
  const reach = reachableIds();
  const deckEmpty = buildDeckCards().length === 0;
  const rows = MAP_CONFIG.floorsPerAct;
  const pos = function (n) { // 칸의 화면 위치(%): 아래가 1층, 위가 보스
    return { x: (n.idx + 0.5) / n.count * 100, y: 90 - (n.floor - 1) * (80 / rows) };
  };
  const nodes = [];
  data.floors.forEach(function (row) { row.forEach(function (n) { nodes.push(n); }); });
  nodes.push(data.boss);

  let lines = "";
  nodes.forEach(function (n) {
    n.next.forEach(function (tid) {
      const t = run.index[tid];
      if (t.act !== n.act) return;
      const a = pos(n), b = pos(t);
      const hot = run.current === n.id && reach.indexOf(tid) >= 0;
      lines += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" class="' + (hot ? "hot" : "") + '"/>';
    });
  });

  root.innerHTML = '<h2>막 ' + act + " / " + MAP_CONFIG.acts + '</h2><div class="mapbox"><svg viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + "</svg></div>";
  const box = root.querySelector(".mapbox");
  nodes.forEach(function (n) {
    const p = pos(n);
    const b = document.createElement("button");
    const can = reach.indexOf(n.id) >= 0 && (n.type === "rest" || !deckEmpty);
    b.className = "node " + n.type + (can ? " can" : "") + (run.visited.indexOf(n.id) >= 0 ? " done" : "") + (run.current === n.id ? " here" : "");
    b.style.left = p.x + "%";
    b.style.top = p.y + "%";
    b.innerHTML = NODE_ICON[n.type] + "<small>" + NODE_NAME[n.type] + "</small>";
    b.disabled = !can;
    b.onclick = function () { startNode(n.id); };
    box.appendChild(b);
  });

  const party = document.createElement("div");
  party.className = "party";
  party.innerHTML = ALLIES.map(function (a) {
    return '<div class="chip' + (a.hp <= 0 ? " dead" : "") + '">' + a.name + "<br>" + (a.hp <= 0 ? "사망" : a.hp + "/" + a.maxHp) + "</div>";
  }).join("");
  root.appendChild(party);
  if (deckEmpty) {
    const w = document.createElement("div");
    w.className = "cnotice";
    w.textContent = "덱이 비었어요. 정비에서 정수를 장착하세요";
    root.appendChild(w);
  }
  const camp = document.createElement("button");
  camp.className = "end-turn cstart";
  camp.textContent = "정비 (정수 장착)";
  camp.onclick = showCamp;
  root.appendChild(camp);
}
