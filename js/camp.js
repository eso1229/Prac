// 정비 화면: 정수를 캐릭터에 장착/해제한다 (전투 밖에서만)
let campSelected = null; // 보관함에서 고른 정수 번호
let campNotice = "";

// 보관함에 남은 정수 목록 (가진 정수 - 장착 중인 정수)
function freeEssences() {
  const free = START_STOCK.slice();
  ALLIES.forEach(function (a) {
    a.essences.forEach(function (id) {
      const i = free.indexOf(id);
      if (i >= 0) free.splice(i, 1);
    });
  });
  return free;
}

function cardsText(eid) {
  return ESSENCES[eid].cards.map(function (e) {
    return CARDS[e.id].name + "×" + e.count;
  }).join(", ");
}

function showCamp() {
  campSelected = null;
  campNotice = "";
  document.getElementById("camp").hidden = false;
  renderCamp();
}

function renderCamp() {
  const root = document.getElementById("camp");
  root.innerHTML = "";
  const add = function (tag, cls, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    el.innerHTML = html;
    root.appendChild(el);
    return el;
  };
  add("h2", "", "정비 (정수 장착)");

  ALLIES.forEach(function (a) {
    const box = add("div", "cchar", "");
    box.innerHTML = '<div class="cchar-name">' + a.name + " <small>최대 체력 " + maxHpOf(a) + "</small></div>";
    const slots = document.createElement("div");
    slots.className = "cslots";
    for (let i = 0; i < RULES.essenceSlots; i++) {
      const eid = a.essences[i];
      const b = document.createElement("button");
      b.className = "cslot" + (eid ? "" : " empty");
      b.innerHTML = eid
        ? ESSENCES[eid].name + "<small>" + ESSENCES[eid].text + "</small>"
        : "비어 있음";
      b.onclick = function () {
        if (eid) { // 장착 중인 정수를 누르면 상세 팝업 (해제는 팝업의 버튼으로)
          openEssencePopup(a, i);
          return;
        } else if (campSelected !== null) {
          const id = freeEssences()[campSelected];
          a.essences.push(id);
          campNotice = a.name + "에게 " + ESSENCES[id].name + " 장착";
        } else {
          campNotice = "아래 보관함에서 정수를 먼저 고르세요";
        }
        campSelected = null;
        renderCamp();
      };
      slots.appendChild(b);
    }
    box.appendChild(slots);
  });

  add("h3", "", "보관함");
  const free = freeEssences();
  if (free.length === 0) add("div", "cempty", "보관함이 비었어요");
  free.forEach(function (eid, i) {
    const b = add("button", "cstock" + (i === campSelected ? " selected" : ""),
      ESSENCES[eid].name + "<small>" + ESSENCES[eid].text + "<br>카드: " + cardsText(eid) + "</small>");
    b.onclick = function () {
      campSelected = campSelected === i ? null : i;
      campNotice = campSelected === null ? "" : "정수를 끼울 캐릭터의 빈 칸을 누르세요";
      renderCamp();
    };
  });

  const deck = buildDeckCards();
  const counts = ALLIES.map(function (a) {
    return a.name + " " + deck.filter(function (c) { return c.owner === a.name; }).length;
  }).join(" · ");
  add("div", "cdeck", "덱 " + deck.length + "장 (" + counts + ")");
  add("div", "cnotice", campNotice || "장착한 정수를 누르면 상세 내용을 볼 수 있어요");
  const start = add("button", "end-turn cstart", deck.length === 0 ? "정수를 장착하세요" : "전투 시작");
  start.disabled = deck.length === 0;
  start.onclick = startBattle;
}

// 카드 한 줄 설명 (비용, 사용 칸, 효과)
function cardDetail(id) {
  const c = CARDS[id];
  let t = "비용 " + c.cost + " · " + rangeText(c.usePos) + "칸에서 사용 · " + cardText(c);
  if (c.hitPos) t += " · 적 " + rangeText(c.hitPos) + "칸";
  return t;
}

// 장착 중인 정수의 상세 팝업
function closePopup() {
  document.getElementById("popup").hidden = true;
}

function openEssencePopup(ally, slotIndex) {
  const eid = ally.essences[slotIndex];
  const e = ESSENCES[eid];
  const pop = document.getElementById("popup");
  const cards = e.cards.map(function (x) {
    return "<li>" + CARDS[x.id].name + " ×" + x.count + "<small>" + cardDetail(x.id) + "</small></li>";
  }).join("");
  pop.innerHTML =
    '<div class="popup">' +
    '<button class="pclose" aria-label="닫기">✕</button>' +
    "<h3>" + e.name + "</h3>" +
    '<div class="ptrait">장착: ' + ally.name + " · 특성: " + e.text + "</div>" +
    '<ul class="pcards">' + cards + "</ul>" +
    '<button class="punequip">장착 해제</button>' +
    "</div>";
  pop.hidden = false;
  pop.onclick = function (ev) { if (ev.target === pop) closePopup(); }; // 바깥을 눌러도 닫힘
  pop.querySelector(".pclose").onclick = closePopup;
  pop.querySelector(".punequip").onclick = function () {
    ally.essences.splice(slotIndex, 1);
    campNotice = e.name + " 해제 (보관함으로)";
    campSelected = null;
    closePopup();
    renderCamp();
  };
}
