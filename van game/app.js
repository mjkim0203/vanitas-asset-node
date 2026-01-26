// ====== GAME CONFIG ======
const GAME = {
  durationSec: 60,
  min: 0,
  max: 12000,
  step: 1,
};

// ====== Whisper messages ======
const whisperSamples = [
  "IA님은 3,000.00로 감정했습니다.",
  "772님은 170.00로 감정했습니다.",
  "Void_Walker님은 9,420.00로 감정했습니다.",
  "Null_Set님은 2,241.00로 감정했습니다.",
  "Zero_One님은 425.00로 감정했습니다.",
  "Anon_KR님은 6,660.00로 감정했습니다.",
  "Ghost_O님님은 1,120.00로 감정했습니다.",
  "User_99님은 8,005.00로 감정했습니다."
];

const whisperLayer = document.getElementById("whisper-layer");
let whisperInterval = null;
let whisperStarted = false;


// "감정가(정답)"은 사용자에게 안 보이게 내부에서만 보관
// 실제 전시에선 아이템별로 다르게 넣으면 됨
let targetValue = getRandomInt(800, 11200);

// ====== DOM ======
const timerText = document.getElementById("timerText");
const slider = document.getElementById("slider");
const handle = document.getElementById("handle");
const yourValueEl = document.getElementById("yourValue");
const resultEl = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

let timeLeft = GAME.durationSec;
let timerId = null;

// slider state
let isDragging = false;
let currentValue = 0;

// ====== INIT ======
startTimer();
setValue(0);
positionHandleByValue(currentValue);

slider.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);

// keyboard accessibility
handle.addEventListener("keydown", (e) => {
  if (timeLeft <= 0) return;

  if (e.key === "ArrowLeft") setValue(currentValue - 50);
  if (e.key === "ArrowRight") setValue(currentValue + 50);
  if (e.key === "Home") setValue(GAME.min);
  if (e.key === "End") setValue(GAME.max);

  positionHandleByValue(currentValue);
});

submitBtn.addEventListener("click", () => {
  endGame(true);
});

resetBtn.addEventListener("click", resetGame);

// ====== TIMER ======
function startTimer(){
  stopTimer();
  renderTimer();

  timerId = setInterval(() => {
    timeLeft -= 1;
    renderTimer();

    if (timeLeft <= 0) {
      timeLeft = 0;
      renderTimer();
      endGame(false);
    }
  }, 1000);
}

function stopTimer(){
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function renderTimer(){
  // 00 : 45 형태
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  timerText.textContent = `${mm} : ${ss}`;
    // 35초 이하부터 whispers 시작 (한 번만)
  if (!whisperStarted && timeLeft <= 45 && timeLeft > 0) {
    startWhispers();
    whisperStarted = true;
  }

}

// ====== SLIDER LOGIC ======
function onPointerDown(e){
  if (timeLeft <= 0) return;

  isDragging = true;
  slider.setPointerCapture?.(e.pointerId);

  // 트랙 클릭해도 그 위치로 이동
  updateByClientX(e.clientX);
}

function onPointerMove(e){
  if (!isDragging) return;
  updateByClientX(e.clientX);
}

function onPointerUp(){
  isDragging = false;
}

function updateByClientX(clientX){
  const rect = slider.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const ratio = x / rect.width;

  const raw = GAME.min + ratio * (GAME.max - GAME.min);
  setValue(raw);
  positionHandleByValue(currentValue);
}

function setValue(v){
  const stepped = Math.round(v / GAME.step) * GAME.step;
  currentValue = clamp(stepped, GAME.min, GAME.max);

  yourValueEl.textContent = `${formatNumber(currentValue)} DZC`;
  handle.setAttribute("aria-valuenow", String(currentValue));
}

function positionHandleByValue(value){
  const rect = slider.getBoundingClientRect();
  const ratio = (value - GAME.min) / (GAME.max - GAME.min);
  const x = ratio * rect.width;

  handle.style.left = `${x}px`;
}

// ====== END GAME ======
function endGame(isManualSubmit){
  stopTimer();

  // 입력 잠금
  isDragging = false;

  const diff = Math.abs(currentValue - targetValue);
  const score = calcScore(diff); // 0~100 (가까울수록 높음)

  const verb = isManualSubmit ? "제출" : "시간 종료";
  resultEl.textContent =
    `${verb}! 당신의 값: ${formatNumber(currentValue)} DZC / ` +
    `감정가와의 차이: ${formatNumber(diff)} DZC / ` +
    `정확도: ${score.toFixed(1)}%`;

  // 전시/게임 느낌: “정답 공개”는 원하면 숨길 수도 있음
  // 여기서는 점수 계산이 이해되도록 정답도 공개 옵션 제공
  resultEl.textContent += ` (IEAA 감정가: ${formatNumber(targetValue)} DZC)`;
}

function calcScore(diff){
  // diff가 0이면 100점
  // diff가 max(=12000)이면 0점에 수렴
  const range = GAME.max - GAME.min;
  const normalized = clamp(1 - diff / range, 0, 1);
  return normalized * 100;
}

// ====== RESET ======
function resetGame(){
  timeLeft = GAME.durationSec;
  targetValue = getRandomInt(800, 11200);
  resultEl.textContent = "";
  setValue(0);

  // 레이아웃 변화 대비 (리셋 후 핸들 위치 재계산)
  requestAnimationFrame(() => positionHandleByValue(currentValue));

  startTimer();
}

// ====== UTILS ======
function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

function formatNumber(n){
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 창 크기 바뀌면 핸들 위치 재계산
window.addEventListener("resize", () => positionHandleByValue(currentValue));


function startWhispers(){
  stopWhispers(); // 안전

  // 시작하자마자 한 번 "배치"로 띄우기
  spawnWhisperBatch();

  // 5초마다 한 번 "배치"
  whisperInterval = setInterval(() => {
    spawnWhisperBatch();
  }, 3000);
}


function stopWhispers(){
  if (whisperInterval) clearInterval(whisperInterval);
  whisperInterval = null;
}

function spawnWhisper(){
  if (!whisperLayer) return;

  const el = document.createElement("div");
  el.className = "whisper" + (Math.random() < 0.5 ? " small" : "");
  el.textContent = whisperSamples[Math.floor(Math.random() * whisperSamples.length)];

  // 랜덤 위치: 스크린샷처럼 좌/우 사이드에 주로 뜨게
  const side = Math.random() < 0.5 ? "left" : "right";

  // top 영역 범위(너 이미지 주변에 뜨는 느낌)
  const top = rand(18, 55); // vh
  const x = side === "left" ? rand(6, 22) : rand(62, 86); // vw

  el.style.top = `${top}vh`;
  el.style.left = `${x}vw`;

  // 살짝 회전/스케일 변주 (겹쳐도 자연스러움)
  el.style.transform = `translateY(6px) rotate(${rand(-2, 2)}deg)`;

  whisperLayer.appendChild(el);

  // 애니메이션 끝나면 삭제 (겹쳐서 남지 않게)
  setTimeout(() => {
    el.remove();
  }, 3000);
}

function rand(min, max){
  return Math.random() * (max - min) + min;
}

function spawnWhisperBatch(){
  // 한 번에 1~2개
  const count = Math.random() < 0.6 ? 1 : 2; // 60%는 1개, 40%는 2개

  for (let i = 0; i < count; i++) {
    // 동시에 뜨되, 0~250ms 정도만 살짝 딜레이 주기(겹치고 자연스럽게)
    const delay = i === 0 ? 0 : Math.floor(Math.random() * 250);
    setTimeout(() => spawnWhisper(), delay);
  }
}
