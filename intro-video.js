/**
 * WordRaiders Cinematic Intro Video & Storyboard Overlay (v3 - Multi-layer Parallax Runner & Responsive 16:9)
 * - 16:9 Contained Theater: Fits 100% cleanly on any mobile or desktop screen without cropping.
 * - Dynamic Running Motion: Animated running gait bobbing, forward lean, twin chromatic after-image trails.
 * - Separate Parallax City: City tracks horizontally beneath the runner's stride.
 * - Hard-light footstep shockwaves, streaming speed lines, and trailing lexicon letter glyphs.
 * - Safe-area anchored Bottom-Right "Skip Intro" button.
 * - Replay button accessible from game header.
 */
(function () {
  if (window.__WORDRAIDERS_INTRO_INITIALIZED__) return;
  window.__WORDRAIDERS_INTRO_INITIALIZED__ = true;

  const isGhPages = window.location.pathname.startsWith('/wordraiders');
  const BASE_URL = isGhPages ? '/wordraiders/' : './';
  const BG_URL = `${BASE_URL}code_video_assets/keyframes/wordraider_cyber_city_bg.jpg`;
  const RUNNER_URL = `${BASE_URL}code_video_assets/keyframes/wordraider_running_ninja.jpg`;
  const AUDIO_URL = `${BASE_URL}code_video_assets/audio_voiceovers/intro_trailer_hardlight_heist.mp3`;

  // Inject CSS Styles
  const style = document.createElement('style');
  style.id = 'wordraiders-intro-styles';
  style.textContent = `
    #wr-intro-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #02050c;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      user-select: none;
      -webkit-user-select: none;
      transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s ease;
      padding-top: max(env(safe-area-inset-top, 16px), 14px);
      padding-bottom: max(env(safe-area-inset-bottom, 20px), 16px);
      box-sizing: border-box;
    }
    #wr-intro-overlay.fade-out {
      opacity: 0;
      pointer-events: none;
      transform: scale(1.02);
    }

    /* Ambient background glow filling tall mobile screens */
    .wr-intro-ambient-bg {
      position: absolute;
      inset: -10%;
      width: 120%;
      height: 120%;
      background-image: url("${BG_URL}");
      background-size: cover;
      background-position: center;
      filter: blur(50px) brightness(0.35) saturate(1.5);
      transform: scale(1.1);
      pointer-events: none;
      opacity: 0.9;
    }

    /* Top HUD Navigation Bar */
    .wr-intro-top-bar {
      position: relative;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 18px;
      width: 100%;
      box-sizing: border-box;
    }
    .wr-intro-hud-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(6, 12, 24, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 229, 255, 0.4);
      border-radius: 20px;
      color: #00E5FF;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.25);
    }
    .wr-intro-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF007F;
      box-shadow: 0 0 8px #FF007F;
      animation: wrPulse 1.2s infinite ease-in-out;
    }
    @keyframes wrPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* 16:9 Contained Theater Box: Guaranteed 100% Fit On Mobile */
    .wr-intro-stage-wrapper {
      position: relative;
      z-index: 20;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0 14px;
      box-sizing: border-box;
    }
    .wr-intro-theater {
      position: relative;
      width: 100%;
      max-width: 940px;
      aspect-ratio: 16 / 9;
      max-height: 60vh;
      border-radius: 16px;
      overflow: hidden;
      background: #02040a;
      box-shadow: 0 12px 45px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 229, 255, 0.25);
      border: 1.5px solid rgba(0, 229, 255, 0.35);
    }

    /* Layer 1: Background City with Smooth Parallax Camera Tracking */
    .wr-theater-bg {
      position: absolute;
      inset: -5%;
      width: 120%;
      height: 110%;
      background-image: url("${BG_URL}");
      background-size: cover;
      background-position: center bottom;
      animation: wrCityTracking 16s ease-in-out infinite alternate;
    }
    @keyframes wrCityTracking {
      0% {
        transform: translateX(0%) scale(1.05);
      }
      50% {
        transform: translateX(-4%) scale(1.08);
      }
      100% {
        transform: translateX(-7%) scale(1.05);
      }
    }

    /* Layer 2: Parallax Speed Lines */
    .wr-speed-line {
      position: absolute;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00E5FF, #FF007F, transparent);
      opacity: 0.8;
      border-radius: 2px;
      pointer-events: none;
      animation: wrSpeedRush 0.75s linear infinite;
    }
    @keyframes wrSpeedRush {
      0% { transform: translateX(110%); opacity: 0; }
      20% { opacity: 0.9; }
      80% { opacity: 0.9; }
      100% { transform: translateX(-150%); opacity: 0; }
    }

    /* Layer 3: Hard-Light Footstep Shockwave Rings */
    .wr-step-impact {
      position: absolute;
      width: 70px;
      height: 28px;
      border: 2px solid #00E5FF;
      border-radius: 50%;
      transform: scale(0.2);
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 0 20px #00E5FF, inset 0 0 12px #FF007F;
    }
    .wr-step-impact.step-left {
      right: 30%;
      bottom: 14%;
      animation: wrStepBurst 0.65s infinite ease-out;
    }
    .wr-step-impact.step-right {
      right: 22%;
      bottom: 12%;
      animation: wrStepBurst 0.65s 0.325s infinite ease-out;
    }
    @keyframes wrStepBurst {
      0% { transform: scale(0.2); opacity: 1; border-color: #FF007F; }
      40% { opacity: 0.9; border-color: #00E5FF; }
      100% { transform: scale(2.8); opacity: 0; }
    }

    /* Layer 4: Running Character Motion Dynamics */
    .wr-runner-container {
      position: absolute;
      right: 15%;
      bottom: 6%;
      width: 54%;
      height: 85%;
      pointer-events: none;
      animation: wrRunGait 0.65s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
    }
    @keyframes wrRunGait {
      0% {
        transform: translateY(0px) rotate(0deg);
      }
      25% {
        transform: translateY(-16px) rotate(-2deg);
      }
      50% {
        transform: translateY(4px) rotate(1.5deg);
      }
      75% {
        transform: translateY(-18px) rotate(-2.5deg);
      }
      100% {
        transform: translateY(0px) rotate(0deg);
      }
    }

    /* Twin Chromatic After-Image Ghost Trails */
    .wr-runner-ghost-cyan, .wr-runner-ghost-pink {
      position: absolute;
      inset: 0;
      background-image: url("${RUNNER_URL}");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center bottom;
      mix-blend-mode: screen;
      pointer-events: none;
    }
    .wr-runner-ghost-cyan {
      transform: translate(-12px, 3px);
      filter: drop-shadow(0 0 14px #00E5FF);
      opacity: 0.55;
      animation: wrGhostPulse 0.65s infinite alternate;
    }
    .wr-runner-ghost-pink {
      transform: translate(-22px, 6px);
      filter: drop-shadow(0 0 16px #FF007F);
      opacity: 0.45;
      animation: wrGhostPulse 0.65s infinite alternate-reverse;
    }
    @keyframes wrGhostPulse {
      0% { opacity: 0.25; transform: translate(-8px, 2px); }
      100% { opacity: 0.7; transform: translate(-20px, 6px); }
    }

    /* Primary Ninja Runner Body (Pitch Black Disappears in Screen Mode) */
    .wr-runner-body {
      position: absolute;
      inset: 0;
      background-image: url("${RUNNER_URL}");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center bottom;
      mix-blend-mode: screen;
      filter: contrast(1.15) brightness(1.1);
    }

    /* Layer 5: Flying Lexicon Code Letters */
    .wr-flying-letter {
      position: absolute;
      font-size: 16px;
      font-weight: 900;
      color: #00E5FF;
      text-shadow: 0 0 12px #00E5FF;
      opacity: 0;
      pointer-events: none;
      animation: wrLetterFly 1.6s linear infinite;
    }
    @keyframes wrLetterFly {
      0% { transform: translate(120%, 0) scale(0.5); opacity: 0; }
      25% { opacity: 0.9; }
      75% { opacity: 0.75; }
      100% { transform: translate(-380%, 40px) scale(1.3); opacity: 0; }
    }

    /* Letterbox Cinematic Bars */
    .wr-theater-bar-top, .wr-theater-bar-bottom {
      position: absolute;
      left: 0;
      right: 0;
      height: 5%;
      background: #020409;
      z-index: 10;
      pointer-events: none;
    }
    .wr-theater-bar-top { top: 0; border-bottom: 1px solid rgba(0, 229, 255, 0.2); }
    .wr-theater-bar-bottom { bottom: 0; border-top: 1px solid rgba(0, 229, 255, 0.2); }

    /* Bottom Control Bar: Subtitles + Skip Button */
    .wr-intro-bottom-bar {
      position: relative;
      z-index: 30;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 14px;
      padding: 8px 18px;
      width: 100%;
      box-sizing: border-box;
    }

    /* Subtitle Caption Box */
    .wr-intro-caption-box {
      flex: 1;
      max-width: 620px;
    }
    .wr-intro-caption {
      display: inline-block;
      padding: 8px 14px;
      background: rgba(6, 12, 24, 0.92);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-left: 4px solid #00E5FF;
      border-radius: 4px;
      color: #FFFFFF;
      font-size: clamp(13px, 3.4vw, 20px);
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
      transition: border-color 0.2s, color 0.2s, text-shadow 0.2s;
    }
    .wr-intro-caption.highlight {
      border-left-color: #FF007F;
      color: #FFD700;
      text-shadow: 0 0 16px rgba(255, 215, 0, 0.55);
    }

    /* Skip Intro Button (Bottom Right) */
    #wr-intro-skip-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: rgba(10, 18, 36, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1.5px solid rgba(0, 229, 255, 0.65);
      border-radius: 28px;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.6px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 229, 255, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      -webkit-tap-highlight-color: transparent;
    }
    #wr-intro-skip-btn:hover {
      background: rgba(0, 229, 255, 0.25);
      border-color: #00E5FF;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 229, 255, 0.45);
    }
    #wr-intro-skip-btn:active {
      transform: scale(0.96);
    }
    .wr-skip-arrow {
      color: #00E5FF;
      font-size: 15px;
    }

    /* Autoplay fallback start prompt */
    #wr-intro-unmute-modal {
      position: absolute;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(2, 5, 12, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    #wr-intro-unmute-modal.hidden {
      display: none;
    }
    .wr-unmute-btn {
      padding: 16px 32px;
      background: linear-gradient(135deg, #00E5FF, #0077FE);
      border: none;
      border-radius: 36px;
      color: #02050c;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(0, 229, 255, 0.5);
      transition: transform 0.2s ease;
    }
    .wr-unmute-btn:hover {
      transform: scale(1.05);
    }

    /* Replay Button attached to header once intro finishes */
    #wr-watch-intro-btn {
      position: fixed;
      top: calc(env(safe-area-inset-top, 12px) + 8px);
      right: 14px;
      z-index: 9999;
      padding: 6px 14px;
      background: rgba(10, 18, 36, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 229, 255, 0.45);
      border-radius: 18px;
      color: #00E5FF;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      transition: all 0.2s ease;
    }
    #wr-watch-intro-btn:hover {
      background: rgba(0, 229, 255, 0.25);
      border-color: #00E5FF;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  // Synchronized Voiceover Captions (Option 3: Mythic Quest Narrator)
  const CAPTION_CUES = [
    { start: 0.0, end: 3.8, text: "What if words weren't just letters?", highlight: false },
    { start: 3.8, end: 8.0, text: "What if every word was a cheat code to reality?", highlight: true },
    { start: 8.0, end: 11.8, text: "Spell it. Forge it. Weaponize it.", highlight: false },
    { start: 11.8, end: 15.2, text: "WELCOME TO WORDRAIDERS.", highlight: true },
    { start: 15.2, end: 19.5, text: "Nine brutal chapters. Fifty-six spelling realms.", highlight: false },
    { start: 19.5, end: 23.0, text: "Colossal bosses standing between you and mastery.", highlight: true },
    { start: 23.0, end: 27.5, text: "THE RAID BEGINS NOW. CONQUER THE JOURNEY.", highlight: true },
  ];

  function createIntroElements() {
    const overlay = document.createElement('div');
    overlay.id = 'wr-intro-overlay';

    overlay.innerHTML = `
      <!-- Ambient Background Glow -->
      <div class="wr-intro-ambient-bg"></div>

      <!-- Top HUD Header -->
      <div class="wr-intro-top-bar">
        <div class="wr-intro-hud-badge">
          <div class="wr-intro-badge-dot"></div>
          <span>WordRaiders // Prologue</span>
        </div>
      </div>

      <!-- Contained 16:9 Theater Stage -->
      <div class="wr-intro-stage-wrapper">
        <div class="wr-intro-theater">
          <div class="wr-theater-bar-top"></div>

          <!-- Parallax City Backdrop -->
          <div class="wr-theater-bg"></div>

          <!-- Speed Lasers -->
          <div class="wr-speed-line" style="top: 25%; width: 140px; animation-duration: 0.6s; animation-delay: 0s;"></div>
          <div class="wr-speed-line" style="top: 50%; width: 200px; animation-duration: 0.75s; animation-delay: 0.25s;"></div>
          <div class="wr-speed-line" style="top: 72%; width: 160px; animation-duration: 0.55s; animation-delay: 0.4s;"></div>

          <!-- Hard-Light Footstep Shockwaves Under Boots -->
          <div class="wr-step-impact step-left"></div>
          <div class="wr-step-impact step-right"></div>

          <!-- Trailing Hard-Light Letter Glyphs -->
          <div class="wr-flying-letter" style="top: 35%; right: 12%; animation-delay: 0s;">W</div>
          <div class="wr-flying-letter" style="top: 58%; right: 16%; animation-delay: 0.35s; color: #FF007F; text-shadow: 0 0 12px #FF007F;">R</div>
          <div class="wr-flying-letter" style="top: 22%; right: 24%; animation-delay: 0.8s; color: #FFD700; text-shadow: 0 0 12px #FFD700;">D</div>
          <div class="wr-flying-letter" style="top: 48%; right: 8%; animation-delay: 1.2s;">S</div>

          <!-- Dynamic Ninja Runner with Chromatic Ghost Trails -->
          <div class="wr-runner-container">
            <div class="wr-runner-ghost-pink"></div>
            <div class="wr-runner-ghost-cyan"></div>
            <div class="wr-runner-body"></div>
          </div>

          <div class="wr-theater-bar-bottom"></div>
        </div>
      </div>

      <!-- Bottom HUD & Subtitle Controls -->
      <div class="wr-intro-bottom-bar">
        <div class="wr-intro-caption-box">
          <div class="wr-intro-caption" id="wr-intro-caption-text">CONQUER THE JOURNEY</div>
        </div>
        <button id="wr-intro-skip-btn" aria-label="Skip Intro Video">
          <span>Skip Intro</span>
          <span class="wr-skip-arrow">⏭</span>
        </button>
      </div>

      <!-- Autoplay Fallback Modal -->
      <div id="wr-intro-unmute-modal" class="hidden">
        <button class="wr-unmute-btn" id="wr-intro-start-btn">⚔️ Start Expedition</button>
      </div>
    `;

    const audio = new Audio(AUDIO_URL);
    audio.preload = 'auto';

    document.body.appendChild(overlay);

    const captionEl = document.getElementById('wr-intro-caption-text');
    const skipBtn = document.getElementById('wr-intro-skip-btn');
    const unmuteModal = document.getElementById('wr-intro-unmute-modal');
    const startBtn = document.getElementById('wr-intro-start-btn');

    let dismissed = false;

    function dismissIntro() {
      if (dismissed) return;
      dismissed = true;
      audio.pause();
      overlay.classList.add('fade-out');
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        createReplayButton();
      }, 450);
    }

    skipBtn.addEventListener('click', dismissIntro);

    audio.addEventListener('timeupdate', () => {
      const cur = audio.currentTime;
      const cue = CAPTION_CUES.find(c => cur >= c.start && cur < c.end);
      if (cue && captionEl) {
        captionEl.textContent = cue.text;
        if (cue.highlight) {
          captionEl.classList.add('highlight');
        } else {
          captionEl.classList.remove('highlight');
        }
      }
    });

    audio.addEventListener('ended', dismissIntro);

    // Attempt Autoplay with Audio
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        unmuteModal.classList.remove('hidden');
        startBtn.addEventListener('click', () => {
          unmuteModal.classList.add('hidden');
          audio.play().catch(dismissIntro);
        }, { once: true });
      });
    }

    // Safety timeout in case audio stalls
    setTimeout(() => {
      if (!dismissed && audio.paused && unmuteModal.classList.contains('hidden')) {
        dismissIntro();
      }
    }, 32000);
  }

  function createReplayButton() {
    if (document.getElementById('wr-watch-intro-btn')) return;
    const replayBtn = document.createElement('button');
    replayBtn.id = 'wr-watch-intro-btn';
    replayBtn.innerHTML = '▶ Watch Intro';
    replayBtn.title = 'Watch the WordRaiders Cinematic Intro';
    replayBtn.addEventListener('click', () => {
      replayBtn.remove();
      window.__WORDRAIDERS_INTRO_INITIALIZED__ = false;
      createIntroElements();
    });
    document.body.appendChild(replayBtn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createIntroElements);
  } else {
    createIntroElements();
  }
})();
