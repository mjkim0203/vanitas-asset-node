const routes = {
  "/": {
    title: "HOME",
    // ✅ HOME은 “패널 없음” (문구도 없음)
    html: ""
  },

  "/catalog": {
    title: "CATALOG",
    html: `
      <div class="card">
        <h2>CATALOG</h2>
        <p>아이템 리스트 / 랭킹 / 실시간 감정가(주관식/슬라이더) 등으로 확장 가능한 영역.</p>
      </div>
    `
  },

  "/auction": {
    title: "AUCTION ROOM",
    html: `
      <div class="card">
        <h2>AUCTION ROOM</h2>
        <p>경매 진행, 타이머, 말풍선, 입찰/낙찰 UI 등을 붙일 메인 게임 공간.</p>
      </div>
    `
  },

  "/appraisal": {
    title: "APPRAISAL",
    html: `
      <div class="card">
        <h2>APPRAISAL</h2>
        <p>감정 기준, DZC 환산, ‘가치 산정 로직’(서사/데이터/사용자 반응)을 설명하는 페이지.</p>
      </div>
    `
  },

  "/about": {
    title: "ABOUT",
    html: `
      <div class="card">
        <h2>ABOUT VAN</h2>
        <p>기관 소개(운영 원칙 3가지, 화폐 단위 DZC, 기술 요소 등)로 연결.</p>
      </div>
    `
  }
};

const viewEl = document.getElementById("view");
const navLinks = Array.from(document.querySelectorAll(".rail-menu a"));
const iconButtons = Array.from(document.querySelectorAll(".icon-btn"));
const mainEl = document.querySelector(".main"); // ✅ panel 토글용

function getPathFromHash() {
  const hash = window.location.hash || "#/";
  const path = hash.replace("#", "");
  return path || "/";
}

function setActiveNav(path) {
  navLinks.forEach(a => {
    const target = a.getAttribute("data-route");
    a.classList.toggle("active", target === path);
  });
}

function renderRoute() {
  const path = getPathFromHash();
  const route = routes[path] || routes["/"];

  // ✅ HOME이면 패널을 숨기고(= has-panel 제거), view도 비우기
  const isHome = path === "/" || path === "";
  if (isHome) {
    mainEl.classList.remove("has-panel");
    viewEl.innerHTML = "";
  } else {
    mainEl.classList.add("has-panel");
    viewEl.innerHTML = route.html;
  }

  setActiveNav(path);
}

function go(path) {
  window.location.hash = `#${path}`;
}

window.addEventListener("hashchange", renderRoute);

// 아이콘 클릭 → 해당 섹션으로 진입
iconButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    if (target) go(target);
  });
});

// 첫 로드
renderRoute();
