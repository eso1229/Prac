// 전투 결과: 승리(정수 보상 3택 1) / 패배(런 종료) / 최종 보스 클리어

// 보상 후보: 정수 종류에서 무작위로 고른다
function rewardChoices() {
  return shuffle(Object.keys(ESSENCES)).slice(0, RULES.rewardChoices);
}

// 전투가 끝났을 때 (main.js의 afterAction이 부른다)
function onBattleEnd(kind) {
  if (kind === "win") {
    retireFallen();  // 영구 사망한 아군의 정수는 보관함으로
    resolveNode();   // 이 칸을 지나온 칸으로 기록
    if (run.over === "clear") {
      clearSave();
      showResult("clear");
      return;
    }
    run.pendingReward = rewardChoices();
    saveRun();
    showResult("win");
  } else {
    run.over = "lose";
    clearSave();
    showResult("lose");
  }
}

function startNewRun() {
  newRun();
  showMap();
}

function showResult(kind) {
  const box = document.getElementById("result");
  if (kind === "win") {
    const items = run.pendingReward.map(function (eid) {
      return '<button class="rchoice" data-id="' + eid + '">' + ESSENCES[eid].name +
        "<small>" + ESSENCES[eid].text + "<br>카드: " + cardsText(eid) + "</small></button>";
    }).join("");
    box.innerHTML = '<div class="popup"><h3>승리!</h3><div class="ptrait">보상: 정수를 하나 고르세요</div>' + items + "</div>";
    box.querySelectorAll(".rchoice").forEach(function (b) {
      b.onclick = function () {
        ownedEssences.push(b.dataset.id); // 보관함에 추가
        run.pendingReward = null;
        saveRun();
        showMap();
      };
    });
  } else {
    const clear = kind === "clear";
    box.innerHTML = '<div class="popup"><h3>' + (clear ? "클리어!" : "패배...") + "</h3>" +
      '<div class="ptrait">' + (clear ? "최종 보스를 쓰러뜨렸어요" : "아군이 모두 쓰러졌어요. 이번 런이 끝났어요") + "</div>" +
      '<button class="punequip" id="new-run-btn">처음부터 새로 시작</button></div>';
    document.getElementById("new-run-btn").onclick = startNewRun;
  }
  box.hidden = false;
}
