/**
 * WordRaiders Cinematic Intro Video & Storyboard Overlay
 * Plays the "Conquer the Journey" Hard-Light Heist trailer on app launch.
 * Includes a prominent "Skip Intro" button in the bottom-right corner.
 */
(function () {
  // Prevent duplicate initialization
  if (window.__WORDRAIDERS_INTRO_INITIALIZED__) return;
  window.__WORDRAIDERS_INTRO_INITIALIZED__ = true;

  // Resolve base URL for GitHub Pages (/wordraiders/) or root (/)
  const isGhPages = window.location.pathname.startsWith('/wordraiders');
  const BASE_URL = isGhPages ? '/wordraiders/' : './';
  const IMAGE_URL = `${BASE_URL}code_video_assets/keyframes/keyframe_intro_hardlight_heist.jpg`;
  const AUDIO_URL = `${BASE_URL}code_video_assets/audio_voiceovers/intro_trailer_hardlight_heist.mp3`;

  // Inject CSS Styles
  const style = document.createElement('style');
  style.id = 'wordraiders-intro-styles';
  style.textContent = `
    #wr-intro-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #060913;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      user-select: none;
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s ease;
    }
    #wr-intro-overlay.fade-out {
      opacity: 0;
      pointer-events: none;
      transform: scale(1.04);
    }
    .wr-intro-bg {
      position: absolute;
      inset: -5%;
      width: 110%;
      height: 110%;
      background-image: url("${IMAGE_URL}");
      background-size: cover;
      background-position: center 35%;
      filter: brightness(0.9) contrast(1.15);
      animation: wrKenBurns 28s ease-out forwards;
      will-change: transform;
    }
    @keyframes wrKenBurns {
      0% { transform: scale(1) translate(0, 0); }
      50% { transform: scale(1.12) translate(-2%, -1%); }
      100% { transform: scale(1.22) translate(1%, -2%); }
    }
    .wr-intro-vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, transparent 40%, rgba(6, 9, 19, 0.75) 85%, #060913 100%),
                  linear-gradient(to bottom, rgba(6,9,19,0.7) 0%, transparent 20%, transparent 75%, rgba(6,9,19,0.9) 100%);
      pointer-events: none;
    }
    /* Letterbox cinematic widescreen bars */
    .wr-intro-bar-top, .wr-intro-bar-bottom {
      position: absolute;
      left: 0;
      right: 0;
      height: 7vh;
      background: #04060c;
      z-index: 10;
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
    }
    .wr-intro-bar-top { top: 0; border-bottom: 1px solid rgba(0, 229, 255, 0.2); }
    .wr-intro-bar-bottom { bottom: 0; border-top: 1px solid rgba(0, 229, 255, 0.2); }
    
    .wr-intro-hud-badge {
      position: absolute;
      top: calc(7vh + 16px);
      left: 24px;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(8, 14, 28, 0.75);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.4);
      border-radius: 20px;
      color: #00E5FF;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.2);
    }
    .wr-intro-badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #FF007F;
      box-shadow: 0 0 8px #FF007F;
      animation: wrBlink 1.2s infinite;
    }
    @keyframes wrBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    /* Subtitle & Kinetic Caption Box */
    .wr-intro-caption-container {
      position: absolute;
      bottom: calc(7vh + 32px);
      left: 5%;
      right: 200px;
      z-index: 20;
      pointer-events: none;
    }
    .wr-intro-caption {
      display: inline-block;
      padding: 10px 18px;
      background: rgba(6, 10, 22, 0.85);
      backdrop-filter: blur(12px);
      border-left: 4px solid #00E5FF;
      border-radius: 4px;
      color: #FFFFFF;
      font-size: clamp(16px, 2.8vw, 26px);
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1);
      transform: translateY(0);
      opacity: 1;
    }
    .wr-intro-caption.highlight {
      border-left-color: #FF007F;
      color: #FFD700;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    /* Bottom-Right Skip Button */
    #wr-intro-skip-btn {
      position: absolute;
      bottom: calc(7vh + 24px);
      right: 24px;
      z-index: 30;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 22px;
      background: rgba(12, 20, 37, 0.85);
      backdrop-filter: blur(16px);
      border: 1.5px solid rgba(0, 229, 255, 0.5);
      border-radius: 30px;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 229, 255, 0.2);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #wr-intro-skip-btn:hover, #wr-intro-skip-btn:focus-visible {
      background: rgba(0, 229, 255, 0.2);
      border-color: #00E5FF;
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 25px rgba(0, 229, 255, 0.4);
      outline: none;
    }
    #wr-intro-skip-btn:active {
      transform: scale(0.97);
    }
    .wr-skip-arrow {
      color: #00E5FF;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    #wr-intro-skip-btn:hover .wr-skip-arrow {
      transform: translateX(3px);
    }

    /* Start / Unmute Overlay if browser blocks autoplay */
    #wr-intro-unmute-modal {
      position: absolute;
      inset: 0;
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(6, 9, 19, 0.65);
      backdrop-filter: blur(8px);
      transition: opacity 0.3s ease;
    }
    #wr-intro-unmute-modal.hidden {
      display: none;
    }
    .wr-unmute-btn {
      padding: 18px 36px;
      background: linear-gradient(135deg, #00E5FF, #0077FE);
      border: none;
      border-radius: 40px;
      color: #050B17;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 10px 35px rgba(0, 229, 255, 0.5);
      transition: all 0.2s ease;
    }
    .wr-unmute-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 14px 45px rgba(0, 229, 255, 0.7);
    }
    .wr-unmute-subtitle {
      margin-top: 14px;
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
      letter-spacing: 0.5px;
    }

    /* Replay Button in corner of finished game */
    #wr-watch-intro-btn {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 9999;
      padding: 6px 12px;
      background: rgba(12, 20, 37, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 18px;
      color: #00E5FF;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    #wr-watch-intro-btn:hover {
      background: rgba(0, 229, 255, 0.2);
      border-color: #00E5FF;
    }
  `;
  document.head.appendChild(style);

  // Subtitle Cues synchronized with audio playback
  const CAPTION_CUES = [
    { start: 0.0, end: 3.8, text: "What if words weren't just letters?", highlight: false },
    { start: 3.8, end: 8.0, text: "What if every word was a cheat code to reality?", highlight: true },
    { start: 8.0, end: 11.8, text: "Spell it. Forge it. Weaponize it.", highlight: false },
    { start: 11.8, end: 15.2, text: "WELCOME TO WORDRAIDERS.", highlight: true },
    { start: 15.2, end: 19.5, text: "Nine brutal chapters. Fifty-six spelling realms.", highlight: false },
    { start: 19.5, end: 23.0, text: "Colossal bosses standing between you and mastery.", highlight: true },
    { start: 23.0, end: 27.0, text: "THE RAID BEGINS NOW. CONQUER THE JOURNEY.", highlight: true },
  ];

  function createIntroElements() {
    const overlay = document.createElement('div');
    overlay.id = 'wr-intro-overlay';

    overlay.innerHTML = `
      <div class="wr-intro-bar-top"></div>
      <div class="wr-intro-bg"></div>
      <div class="wr-intro-vignette"></div>
      <div class="wr-intro-bar-bottom"></div>

      <div class="wr-intro-hud-badge">
        <div class="wr-intro-badge-dot"></div>
        <span>WordRaiders // Prologue</span>
      </div>

      <div class="wr-intro-caption-container">
        <div class="wr-intro-caption" id="wr-intro-caption-text">CONQUER THE JOURNEY</div>
      </div>

      <button id="wr-intro-skip-btn" aria-label="Skip Intro Video">
        <span>Skip Intro</span>
        <span class="wr-skip-arrow">⏭</span>
      </button>

      <div id="wr-intro-unmute-modal" class="hidden">
        <button class="wr-unmute-btn" id="wr-intro-start-btn">⚔️ Start Expedition</button>
        <div class="wr-unmute-subtitle">Tap to enable audio & begin the journey</div>
      </div>
    `;

    // Create Audio Element
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
      }, 600);
    }

    skipBtn.addEventListener('click', dismissIntro);

    // Audio timeupdate to sync subtitles
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

    // Attempt Autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with sound was blocked by browser policy -> show tap to play button
        unmuteModal.classList.remove('hidden');
        startBtn.addEventListener('click', () => {
          unmuteModal.classList.add('hidden');
          audio.play().catch(dismissIntro);
        }, { once: true });
      });
    }

    // Auto-dismiss safety timeout if audio fails to trigger ended
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

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createIntroElements);
  } else {
    createIntroElements();
  }
})();
