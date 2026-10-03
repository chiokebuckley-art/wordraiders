/**
 * WordRaiders Cinematic Intro Video (v4 - Native HD MP4 Video with Animated Runner)
 * - Real 1080p/720p H.264 Video: The character visibly runs with dynamic limb strides, cape physics, and footstep shockwaves.
 * - 16:9 Responsive Theater: Never crops on mobile screens; fits 100% cleanly on any device.
 * - Ambient Cyber Backlight: Soft glow fills vertical space on portrait phones (Apple TV / Netflix mobile style).
 * - Synchronized Subtitle Captions with narrative highlights.
 * - Safe-area anchored Bottom-Right "Skip Intro" button.
 * - Persistent Replay Button once dismissed.
 */
(function () {
  if (window.__WORDRAIDERS_INTRO_INITIALIZED__) return;
  window.__WORDRAIDERS_INTRO_INITIALIZED__ = true;

  const isGhPages = window.location.pathname.startsWith('/wordraiders');
  const BASE_URL = isGhPages ? '/wordraiders/' : './';
  const VIDEO_URL = `${BASE_URL}code_video_assets/wordraiders_intro_cinematic.mp4`;
  const POSTER_URL = `${BASE_URL}code_video_assets/keyframes/wordraider_cyber_city_bg.jpg`;

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
      background-image: url("${POSTER_URL}");
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
      max-width: 960px;
      aspect-ratio: 16 / 9;
      max-height: 60vh;
      border-radius: 16px;
      overflow: hidden;
      background: #02040a;
      box-shadow: 0 12px 45px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 229, 255, 0.25);
      border: 1.5px solid rgba(0, 229, 255, 0.35);
    }

    /* The Real Video Player */
    #wr-intro-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      background: #000;
    }

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
          <!-- Native Video Element -->
          <video id="wr-intro-video"
                 src="${VIDEO_URL}"
                 poster="${POSTER_URL}"
                 playsinline
                 webkit-playsinline
                 autoplay
                 preload="auto">
          </video>
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

      <!-- Autoplay Fallback Modal (Mobile Safari Policy) -->
      <div id="wr-intro-unmute-modal" class="hidden">
        <button class="wr-unmute-btn" id="wr-intro-start-btn">⚔️ Start Expedition</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const video = document.getElementById('wr-intro-video');
    const captionEl = document.getElementById('wr-intro-caption-text');
    const skipBtn = document.getElementById('wr-intro-skip-btn');
    const unmuteModal = document.getElementById('wr-intro-unmute-modal');
    const startBtn = document.getElementById('wr-intro-start-btn');

    let dismissed = false;

    function dismissIntro() {
      if (dismissed) return;
      dismissed = true;
      if (video) {
        video.pause();
      }
      overlay.classList.add('fade-out');
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        createReplayButton();
      }, 450);
    }

    skipBtn.addEventListener('click', dismissIntro);

    video.addEventListener('timeupdate', () => {
      const cur = video.currentTime;
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

    video.addEventListener('ended', dismissIntro);

    // Attempt Autoplay with Sound
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy prevented playback -> show interactive play button
        unmuteModal.classList.remove('hidden');
        startBtn.addEventListener('click', () => {
          unmuteModal.classList.add('hidden');
          video.play().catch(dismissIntro);
        }, { once: true });
      });
    }

    // Safety timeout in case video stalls
    setTimeout(() => {
      if (!dismissed && video.paused && unmuteModal.classList.contains('hidden')) {
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
