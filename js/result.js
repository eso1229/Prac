// 전투 결과 화면: 승리(정수 보상 3택 1) / 패배
function leaveBattle() {
  healAllies(); // 전투 후 체력 회복
  document.getElementById("result").hidden = true;
  document.getElementById("game").hidden = true;
  showCamp();
}

// 보상 후보: 정수 종류에서 무작위로 고른다
function rewardChoices() {
  return shuffle(Object.keys(ESSENCES)).slice(0, RULES.rewardChoices);
}

function showResult(kind) {
  const box = document.getElementById("result");
  if (kind === "win") {
    const items = rewardChoices().map(function (eid) {
      return '<button class="rchoice" data-id="' + eid + '">' + ESSENCES[eid].name +
        "<small>" + ESSENCES[eid].text + "<br>카드: " + cardsText(eid) + "</small></button>";
    }).join("");
    box.innerHTML = '<div class="popup"><h3>승리!</h3><div class="ptrait">보상: 정수를 하나 고르세요</div>' + items + "</div>";
    box.querySelectorAll(".rchoice").forEach(function (b) {
      b.onclick = function () {
        ownedEssences.push(b.dataset.id); // 보관함에 추가
        leaveBattle();
        campNotice = ESSENCES[b.dataset.id].name + " 획득 (보관함)";
        renderCamp();
      };
    });
  } else {
    box.innerHTML = '<div class="popup"><h3>패배...</h3><div class="ptrait">아군이 모두 쓰러졌어요</div>' +
      '<button class="punequip" id="to-camp-btn">정비 화면으로</button></div>';
    document.getElementById("to-camp-btn").onclick = leaveBattle;
  }
  box.hidden = false;
}
