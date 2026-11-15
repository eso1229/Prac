// 1단계: 전투 화면 뼈대 (움직임 없음)
// 칸 방향: 적은 왼쪽이 1번, 아군은 오른쪽이 1번 (서로 마주봄)
const SLOT_COUNT = 4;

function makeSlot(unit, pos) {
  const slot = document.createElement("div");
  slot.className = "slot";
  const num = '<div class="pos">' + pos + "</div>";
  if (!unit) {
    slot.classList.add("hidden"); // 빈 칸은 숨김
    slot.innerHTML = num;
    return slot;
  }
  const pct = Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  slot.innerHTML =
    num +
    '<div class="name">' + unit.name + "</div>" +
    '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
    '<div class="stat">체력 ' + unit.hp + "/" + unit.maxHp + "</div>" +
    '<div class="stat block">방어 ' + unit.block + "</div>";
  return slot;
}

function renderRow(rowId, units, reverse) {
  const row = document.getElementById(rowId);
  row.innerHTML = "";
  const order = [];
  for (let p = 1; p <= SLOT_COUNT; p++) order.push(p);
  if (reverse) order.reverse(); // 아군: 4,3,2,1 순서로 그려서 1번이 오른쪽
  order.forEach(function (p) {
    const unit = units.find(function (u) { return u.pos === p; });
    row.appendChild(makeSlot(unit, p));
  });
}

renderRow("enemy-row", ENEMIES, false);
renderRow("ally-row", ALLIES, true);
