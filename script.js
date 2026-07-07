let audioCtx = null;
let track = null;
let gainNode = null;
let letterUnlocked = false;
let musicStarted = false;

/* ---------- LOADING SCREEN ---------- */
function initLoadingScreen() {
    const ls = document.getElementById('loading-screen');
    const container = document.getElementById('ls-particles');
    const btn = document.getElementById('ls-explore-btn');
    if (!ls || !container) return;

    // Generate stars
    for (let i = 0; i < 28; i++) {
        const s = document.createElement('div');
        s.className = 'ls-star';
        const sz = 1.5 + Math.random() * 3;
        s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz}px;animation-delay:${Math.random() * 2.5}s;animation-duration:${1.5 + Math.random() * 2}s`;
        container.appendChild(s);
    }
    // Generate petals
    ['🌸', '🌹', '✨', '🌸', '✨', '🌹', '🌸'].forEach(p => {
        const el = document.createElement('div');
        el.className = 'ls-petal'; el.textContent = p;
        el.style.cssText = `left:${5 + Math.random() * 88}%;animation-duration:${4 + Math.random() * 4}s;animation-delay:${Math.random() * 2.5}s`;
        container.appendChild(el);
    });

    // Shared dismiss function — fades out loading screen → reveals login screen
    let dismissed = false;
    function dismissLS() {
        if (dismissed) return;
        dismissed = true;
        ls.classList.add('ls-fade-out');
        setTimeout(() => ls.remove(), 950);
    }

    // Only the Begin button dismisses the loading screen
    if (btn) btn.addEventListener('click', dismissLS);
}

/* ---------- CLICK-TO-BEGIN MUSIC ---------- */
function initClickToBeginMusic() {
    const loginScreen = document.getElementById('login-screen');
    if (!loginScreen) return;
    const handler = () => {
        if (musicStarted) return;
        musicStarted = true;
        const bgMusic = document.getElementById('bgMusic');
        if (!bgMusic) return;
        initWebAudioAPI();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        bgMusic.volume = 0;
        bgMusic.play().catch(() => { });
        let vol = 0;
        const fadeIn = setInterval(() => {
            vol = Math.min(0.4, vol + 0.005);
            if (gainNode) gainNode.gain.value = vol; else bgMusic.volume = vol;
            if (vol >= 0.4) clearInterval(fadeIn);
        }, 50);
        const hint = document.getElementById('music-hint');
        if (hint) hint.style.opacity = '0';
    };
    loginScreen.addEventListener('click', handler, { once: true });
}

/* ---------- CUSTOM CURSOR ---------- */
function initCustomCursor() {
    const cur = document.getElementById('custom-cursor');
    if (!cur) return;
    document.addEventListener('mousemove', e => {
        cur.style.left = e.clientX + 'px';
        cur.style.top = e.clientY + 'px';
    });
}

/* ---------- FLOATING QUOTES ---------- */
const FLOAT_QUOTES = [
    'Some people become memories. Some become home.',
    'Every smile tells a story worth reading.',
    'She wore her kindness like a crown.',
    'Not all stars belong to the sky.',
    'You make ordinary days feel extraordinary.',
    'Some souls make the whole world feel warmer.',
    'The best things in life are the people we love.'
];
function initFloatingQuotes() {
    const el = document.getElementById('floating-quote');
    const txt = document.getElementById('fq-text');
    if (!el || !txt) return;
    let idx = 0;
    function showQuote() {
        txt.textContent = '\u201c' + FLOAT_QUOTES[idx % FLOAT_QUOTES.length] + '\u201d';
        idx++;
        el.classList.add('fq-show');
        setTimeout(() => el.classList.remove('fq-show'), 6000);
    }
    setTimeout(() => { showQuote(); setInterval(showQuote, 25000); }, 32000);
}

/* ---------- PROGRESS BAR ---------- */
const CHAPTER_TITLES = [
    'A Gift to the World 🌸', 'The Beautiful Soul ✨', 'Her Journey 🌟',
    'Family & Strength 🏡', 'An Unbroken Connection 🕊️', 'Things I Admire 💫',
    'Our Story So Far 💞', 'A Letter From My Heart 🌹', 'To Be Continued 🌙'
];
function updateProgressBar(page) {
    const label = document.getElementById('progress-label');
    const fill = document.getElementById('progress-fill');
    const display = document.getElementById('progress-display');
    if (!label || !fill || !display) return;
    display.classList.remove('hidden');
    label.textContent = 'Chapter ' + page + ' of 9 · ' + CHAPTER_TITLES[page - 1];
    fill.style.width = ((page / 9) * 100) + '%';
}

/* ---------- CHAPTER TRANSITION ---------- */
const TRANS_QUOTES = [
    'Every chapter tells us who we are becoming.',
    'And so the story continues...',
    'The best is yet to come.',
    'Each memory, a masterpiece.',
    'She turns every page with grace.',
    'Some stories are worth reading twice.'
];
function playChapterTransition(callback) {
    const ov = document.getElementById('chapter-transition-overlay');
    const qt = document.getElementById('transition-quote-text');
    if (!ov) { callback(); return; }
    qt.textContent = '\u201c' + TRANS_QUOTES[Math.floor(Math.random() * TRANS_QUOTES.length)] + '\u201d';
    ov.classList.add('ct-active');
    // Hold overlay for 1800ms (includes 1.4s fade-in + quote read time)
    setTimeout(() => {
        callback();
        // Fade out takes another 1.4s (CSS handles it)
        setTimeout(() => ov.classList.remove('ct-active'), 1200);
    }, 1800);
}

/* ---------- EASTER EGG (5 taps on ch9) ---------- */
function initEasterEgg() {
    const modal = document.getElementById('easter-egg-modal');
    const closeBtn = document.getElementById('easterEggCloseBtn');
    if (!modal) return;
    let taps = 0, tapTimer = null;
    document.addEventListener('click', () => {
        const page9 = document.getElementById('page9');
        if (!page9 || !page9.classList.contains('active')) return;
        taps++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { taps = 0; }, 3000);
        if (taps >= 5) { taps = 0; modal.classList.remove('hidden'); }
    });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
}

function initWebAudioAPI() {
    const bgMusic = document.getElementById("bgMusic");
    const volumeSlider = document.getElementById("volumeSlider");
    if (!bgMusic || audioCtx) return;

    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        track = audioCtx.createMediaElementSource(bgMusic);
        gainNode = audioCtx.createGain();
        track.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (volumeSlider) {
            gainNode.gain.value = parseFloat(volumeSlider.value);
        } else {
            gainNode.gain.value = 0.4;
        }
    } catch (e) {
        console.warn("Web Audio API initialization failed:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();
    initClickToBeginMusic();
    initCustomCursor();
    initFloatingQuotes();
    initSecureGateway();
    initNavigationEngine();
    initFloatingAudioEngine();
    initInteractiveFeatures();
    initImageFallbackEngine();
    initEasterEgg();
});

/**
 * SECURE BOUNDARY CONTROLLER
 * Evaluates credentials. Denies layout visibility until condition statement satisfies true.
 */
function initSecureGateway() {
    const exploreBtn = document.getElementById("exploreBtn");
    const loginScreen = document.getElementById("login-screen");
    const loginCard = document.getElementById("loginCard");
    const appContainer = document.getElementById("app-container");
    const passwordField = document.getElementById("passwordField");
    const errorMessage = document.getElementById("loginErrorMessage");
    const bgMusic = document.getElementById("bgMusic");

    // Cryptographic match phrase
    const TARGET_PASS = "2811";

    function verifyPasscode() {
        const enteredInput = passwordField.value.trim();

        if (enteredInput === TARGET_PASS) {
            errorMessage.classList.add("hidden");
            passwordField.classList.remove("input-error");

            // TRIGGERS AUDIO PLAYBACK UPON SUCCESSFUL LOCK ESCAPE
            if (bgMusic) {
                initWebAudioAPI();
                if (audioCtx && audioCtx.state === "suspended") {
                    audioCtx.resume();
                }
                bgMusic.volume = 0.4; // Sets a soft, elegant background ambient volume scale (0.0 to 1.0)
                bgMusic.play().catch(error => {
                    console.log("Audio autoplay restriction handled seamlessly:", error);
                });
                // Sync floating control button state if it exists
                const toggleBtn = document.getElementById("audioToggleBtn");
                if (toggleBtn) toggleBtn.innerHTML = "⏸ Pause";

                const vinylDisk = document.getElementById("vinylDisk");
                if (vinylDisk) vinylDisk.classList.add("rotating");
            }

            // Grant entry clearance with programmatic fade routing
            loginScreen.classList.add("fade-out");
            appContainer.classList.remove("hidden");
            appContainer.scrollTop = 0;
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            triggerStaggeredReveal(document.getElementById("page1"));
        } else {
            errorMessage.classList.remove("hidden");
            passwordField.classList.add("input-error");

            // Execute component shake behavior
            loginCard.classList.add("shake-card");
            passwordField.value = ""; // Clear string sequence for user convenience

            setTimeout(() => {
                loginCard.classList.remove("shake-card");
            }, 400);
        }
    }

    exploreBtn.addEventListener("click", verifyPasscode);
    passwordField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            verifyPasscode();
        }
    });
}

/**
 * MULTI-PAGE APPLICATION STATE TRAVERSAL INTERFACE
 */
function initNavigationEngine() {
    let currentMainPage = 1;
    const totalMainPages = 9; // Expanded safely to match all 9 chapters

    // Dynamic Inner Tab Index Setup mapped for Chapter 2 and Chapter 7
    let ch2SubIndex = 0;
    const ch2SubKeys = ['photos', 'personality', 'kindness', 'uniqueness'];

    let ch7SubIndex = 0;
    const ch7SubKeys = ['firstmeet', 'laughter', 'memories', 'album'];

    let particleInterval = null;

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const bgImage = document.getElementById("app-background");
    const hopElements = document.querySelectorAll(".nav-hop");
    const subNavButtons = document.querySelectorAll(".sub-nav-btn");
    const subPages = document.querySelectorAll(".sub-page");

    function scrollToTop() {
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.scrollTop = 0;
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    /**
     * LOCAL SUB-CHAPTER SYNCHRONIZATION FILTER
     * Safely applies active visibility switches to nested pages inside Chapters 2 & 7
     */
    function synchronizeSubChapters(pageId) {
        if (pageId === 2) {
            const activeKey = ch2SubKeys[ch2SubIndex];
            const ch2Wrapper = document.getElementById("page2");

            ch2Wrapper.querySelectorAll(".sub-nav-btn").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-sub") === activeKey);
            });
            ch2Wrapper.querySelectorAll(".sub-page").forEach(page => {
                if (page.id === `sub-page-${activeKey}`) {
                    page.classList.add("active");
                    page.style.position = "relative";
                } else {
                    page.classList.remove("active");
                    page.style.position = "absolute";
                }
            });
        }
        else if (pageId === 7) {
            const activeKey = ch7SubKeys[ch7SubIndex];
            const ch7Wrapper = document.getElementById("page7");

            ch7Wrapper.querySelectorAll(".sub-nav-btn").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-sub") === activeKey);
            });
            ch7Wrapper.querySelectorAll(".sub-page").forEach(page => {
                if (page.id === `sub-page-${activeKey}`) {
                    page.classList.add("active");
                    page.style.position = "relative";
                } else {
                    page.classList.remove("active");
                    page.style.position = "absolute";
                }
            });
        }

        // Immediately reset scroll so taller previous sub-chapters don't leave ghost scroll space
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.scrollTop = 0;
    }

    function spawnRomanticBirthdayShower() {
        const stage = document.getElementById("rose-shower-container");
        if (!stage) return;
        let itemCounter = 0;
        const completeLimit = 8; // Very minimal

        if (particleInterval) clearInterval(particleInterval);

        particleInterval = setInterval(() => {
            if (itemCounter >= completeLimit || currentMainPage !== 1) {
                clearInterval(particleInterval);
                particleInterval = null;
                return;
            }

            const cleanPetal = document.createElement("div");
            cleanPetal.classList.add("minimal-rose");

            const romanticBdayParticles = ["🌙", "🌸", "🌹"];
            cleanPetal.innerText = romanticBdayParticles[Math.floor(Math.random() * romanticBdayParticles.length)];
            cleanPetal.style.left = `${5 + Math.random() * 90}vw`;

            const internalSpeed = 6.0 + Math.random() * 4.0; // Slower fall
            cleanPetal.style.animationDuration = `${internalSpeed}s`;
            cleanPetal.style.fontSize = `${0.8 + Math.random() * 0.5}rem`;

            stage.appendChild(cleanPetal);
            itemCounter++;

            setTimeout(() => { cleanPetal.remove(); }, internalSpeed * 1000);
        }, 2000);
    }

    function changeMainPage(targetPage, flowDirection = 'neutral') {
        // Play cinematic chapter transition, then do the switch
        playChapterTransition(() => {
            if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }

            const currentDOM = document.getElementById(`page${currentMainPage}`);
            const targetDOM = document.getElementById(`page${targetPage}`);

            if (currentDOM) {
                currentDOM.style.display = 'flex';
                currentDOM.classList.remove('active');
                const staggeredElements = currentDOM.querySelectorAll('.stagger-item, .revealed');
                staggeredElements.forEach(el => el.classList.remove('stagger-item', 'revealed'));
                const oldDOM = currentDOM;
                setTimeout(() => { if (!oldDOM.classList.contains('active')) oldDOM.style.display = 'none'; }, 800);
            }

            currentMainPage = targetPage;

            if (targetDOM) {
                targetDOM.style.display = '';
                targetDOM.classList.add('active');
                triggerStaggeredReveal(targetDOM);
            }

            if (currentMainPage === 2) {
                ch2SubIndex = flowDirection === 'forward' ? 0 : ch2SubKeys.length - 1;
                synchronizeSubChapters(2);
            }
            if (currentMainPage === 7) {
                ch7SubIndex = flowDirection === 'forward' ? 0 : ch7SubKeys.length - 1;
                synchronizeSubChapters(7);
            }

            hopElements.forEach(hop => {
                hop.classList.toggle('active', parseInt(hop.getAttribute('data-target')) === currentMainPage);
            });

            evaluateButtonDisplayStates();

            const translateXValue = (currentMainPage - 1) * -4;
            if (bgImage) bgImage.style.transform = `scale(1.25) translate(${translateXValue}px, 0px)`;

            if (currentMainPage === 1) setTimeout(() => spawnRomanticBirthdayShower(), 300);

            // Volume management per chapter
            const bgMusic = document.getElementById('bgMusic');
            const targetVol = currentMainPage === 4 ? 0.2 : 0.4;
            if (gainNode && audioCtx) {
                gainNode.gain.linearRampToValueAtTime(targetVol, audioCtx.currentTime + 1.5);
            } else if (bgMusic) {
                bgMusic.volume = targetVol;
            }

            // Update progress bar
            updateProgressBar(currentMainPage);

            setTimeout(scrollToTop, 50);
            setTimeout(scrollToTop, 850);
        });
    }

    function evaluateButtonDisplayStates() {
        prevBtn.classList.toggle("hidden", currentMainPage === 1);

        // Handle end-of-path scenarios smoothly on the absolute final sheet (Chapter 9)
        if (currentMainPage === totalMainPages) {
            nextBtn.classList.add("hidden");
            spawnProceduralFloralParticles();
        } else if (currentMainPage === 8) {
            nextBtn.classList.toggle("hidden", !letterUnlocked);
        } else {
            nextBtn.classList.remove("hidden");
        }
    }

    nextBtn.addEventListener("click", () => {
        // Internal linear tab navigation engine logic for sub-chapters
        if (currentMainPage === 2 && ch2SubIndex < ch2SubKeys.length - 1) {
            ch2SubIndex++;
            synchronizeSubChapters(2);
            setTimeout(scrollToTop, 50);
        } else if (currentMainPage === 7 && ch7SubIndex < ch7SubKeys.length - 1) {
            ch7SubIndex++;
            synchronizeSubChapters(7);
            setTimeout(scrollToTop, 50);
        } else {
            if (currentMainPage < totalMainPages) changeMainPage(currentMainPage + 1, 'forward');
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentMainPage === 2 && ch2SubIndex > 0) {
            ch2SubIndex--;
            synchronizeSubChapters(2);
            setTimeout(scrollToTop, 50);
        } else if (currentMainPage === 7 && ch7SubIndex > 0) {
            ch7SubIndex--;
            synchronizeSubChapters(7);
            setTimeout(scrollToTop, 50);
        } else {
            if (currentMainPage > 1) changeMainPage(currentMainPage - 1, 'backward');
        }
    });

    hopElements.forEach(hop => {
        hop.addEventListener("click", () => {
            changeMainPage(parseInt(hop.getAttribute("data-target")), 'forward');
        });
    });

    subNavButtons.forEach(button => {
        button.addEventListener("click", () => {
            const contextSub = button.getAttribute("data-sub");
            if (ch2SubKeys.includes(contextSub)) {
                ch2SubIndex = ch2SubKeys.indexOf(contextSub);
                synchronizeSubChapters(2);
            } else if (ch7SubKeys.includes(contextSub)) {
                ch7SubIndex = ch7SubKeys.indexOf(contextSub);
                synchronizeSubChapters(7);
            }
        });
    });

    function spawnProceduralFloralParticles() {
        const stage = document.getElementById("rose-shower-container");
        if (!stage) return;
        let itemCounter = 0;
        const completeLimit = 8; // Very minimal

        particleInterval = setInterval(() => {
            if (itemCounter >= completeLimit || currentMainPage !== 9) {
                clearInterval(particleInterval);
                return;
            }

            const cleanPetal = document.createElement("div");
            cleanPetal.classList.add("minimal-rose");

            const pList = ["🌙", "🌸", "🌹"];
            cleanPetal.innerText = pList[Math.floor(Math.random() * pList.length)];
            cleanPetal.style.left = `${10 + Math.random() * 80}vw`;

            const internalSpeed = 6.5 + Math.random() * 3.5; // Slower fall
            cleanPetal.style.animationDuration = `${internalSpeed}s`;
            cleanPetal.style.fontSize = `${0.9 + Math.random() * 0.5}rem`;

            stage.appendChild(cleanPetal);
            itemCounter++;

            setTimeout(() => { cleanPetal.remove(); }, internalSpeed * 1000);
        }, 2000);
    }

    // Initial check for display state synchronization rules
    evaluateButtonDisplayStates();
    // Start romantic shower on initial page load
    setTimeout(() => { spawnRomanticBirthdayShower(); }, 500);
}

/**
 * DRAGGABLE, COLLAPSIBLE ROTATING CD FLOATING AUDIO ENGINE
 */
function initFloatingAudioEngine() {
    const pod = document.getElementById("musicPod");
    const vinylDisk = document.getElementById("vinylDisk");
    const toggleBtn = document.getElementById("audioToggleBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const bgMusic = document.getElementById("bgMusic");

    if (!pod || !bgMusic) return;

    const tiltVolumePanel = document.querySelector(".tilt-down-panel");

    let isDragging = false;
    let dragStartX, dragStartY;
    let podStartX, podStartY;
    let hasMoved = false;

    // Synchronize media play/pause states with the turntable physics rules
    function syncPlaybackUI() {
        if (bgMusic.paused) {
            toggleBtn.innerHTML = "▶ Play";
            if (vinylDisk) vinylDisk.classList.remove("rotating");
        } else {
            toggleBtn.innerHTML = "⏸ Pause";
            if (vinylDisk) vinylDisk.classList.add("rotating");
        }
    }

    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        initWebAudioAPI();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (bgMusic.paused) {
            bgMusic.play().then(() => syncPlaybackUI());
        } else {
            bgMusic.pause();
            syncPlaybackUI();
        }
    });

    bgMusic.addEventListener("play", syncPlaybackUI);
    bgMusic.addEventListener("pause", syncPlaybackUI);

    volumeSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (gainNode) {
            gainNode.gain.value = val;
        } else {
            bgMusic.volume = val;
        }
    });

    volumeSlider.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Expand / Collapse / Tilt Selection Pipeline
    pod.addEventListener("click", (e) => {
        if (hasMoved) return;

        // Clicked the disk/axis wrapper -> Toggle master layout dimensions
        if (e.target.closest(".cd-wrap-axis")) {
            if (pod.classList.contains("expanded")) {
                tiltVolumePanel.classList.remove("show-volume");
                pod.classList.remove("expanded");
            } else {
                pod.classList.add("expanded");
            }
        } else if (e.target.closest(".audio-toggle-action")) {
            return;
        } else {
            // Clicked inside open panel area -> Toggle drop down tilt volume panel
            if (pod.classList.contains("expanded")) {
                tiltVolumePanel.classList.toggle("show-volume");
            }
        }
    });

    // Handle outside container dismiss clicks smoothly
    document.addEventListener("click", (e) => {
        if (!pod.contains(e.target) && pod.classList.contains("expanded")) {
            tiltVolumePanel.classList.remove("show-volume");
            pod.classList.remove("expanded");
        }
    });

    // Hardware Accelerated Pointer Drag Operations
    const startDrag = (clientX, clientY) => {
        isDragging = true;
        hasMoved = false;
        dragStartX = clientX;
        dragStartY = clientY;

        const rect = pod.getBoundingClientRect();
        podStartX = rect.left;
        podStartY = rect.top;

        pod.style.transition = "none";
    };

    const doDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved = true;
        }

        let targetX = podStartX + deltaX;
        let targetY = podStartY + deltaY;

        const padding = 15;
        targetX = Math.max(padding, Math.min(window.innerWidth - pod.offsetWidth - padding, targetX));
        targetY = Math.max(padding, Math.min(window.innerHeight - pod.offsetHeight - padding, targetY));

        pod.style.top = `${targetY}px`;
        pod.style.bottom = "auto";

        // Anchor dynamically from the left or right depending on which side the pod is on.
        // This prevents the expanded controls from clipping off the screen edge.
        if (targetX < window.innerWidth / 2) {
            pod.style.left = `${targetX}px`;
            pod.style.right = "auto";
        } else {
            pod.style.right = `${window.innerWidth - targetX - pod.offsetWidth}px`;
            pod.style.left = "auto";
        }
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        pod.style.transition = "width 0.4s cubic-bezier(0.23, 1, 0.32, 1), background-color 0.3s, border-radius 0.4s";
    };

    pod.addEventListener("mousedown", (e) => {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
        startDrag(e.clientX, e.clientY);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
    });

    const mouseMoveHandler = (e) => doDrag(e.clientX, e.clientY);
    const mouseUpHandler = () => {
        stopDrag();
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
    };

    pod.addEventListener("touchstart", (e) => {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    pod.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault(); // Prevent background page scrolling while dragging
        const touch = e.touches[0];
        doDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    pod.addEventListener("touchend", stopDrag);
}

/**
 * CONFETTI AND LOVE PARTICLE EXPLOSION ENGINE
 */
function triggerConfettiBlast(element) {
    const rect = element.getBoundingClientRect();
    const cakeX = rect.left + rect.width / 2;
    const cakeY = rect.top + rect.height / 2;
    // Cuter emoji selection!
    const emojis = ["🎀", "💖", "✨", "🌸", "🦋", "🎂", "🧸", "💌"];

    // Increased particle count for a fuller, more beautiful blast
    for (let i = 0; i < 60; i++) {
        const p = document.createElement("div");
        p.classList.add("cute-burst-particle");
        p.innerText = emojis[Math.floor(Math.random() * emojis.length)];

        // Random trajectory with more upward bias and wider spread
        const angle = (Math.random() * Math.PI) + Math.PI; // Upward half-circle
        const velocity = 100 + Math.random() * 250;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 150; // Stronger upward trend

        p.style.left = `${cakeX}px`;
        p.style.top = `${cakeY}px`;
        p.style.setProperty("--dx", `${dx}px`);
        p.style.setProperty("--dy", `${dy}px`);
        p.style.setProperty("--rot", `${-360 + Math.random() * 720}deg`);

        const duration = 1.5 + Math.random() * 2.0;
        p.style.animationDuration = `${duration}s`;
        p.style.fontSize = `${1.2 + Math.random() * 1.5}rem`;

        document.body.appendChild(p);

        setTimeout(() => {
            p.remove();
        }, duration * 1000);
    }
}

/**
 * INTERACTIVE BIRTHDAY AND PROPOSAL EVENTS INITIALIZER
 */
function initInteractiveFeatures() {
    // Microphone Blow-to-Extinguish Feature
    const cakeWrapper = document.getElementById("cakeWrapper");
    const candleFlame = document.getElementById("candleFlame");
    const wishReveal = document.getElementById("wishReveal");
    const cakeInstruction = document.getElementById("cakeInstruction");
    const micPermissionBtn = document.getElementById("micPermissionBtn");
    let cakeBlown = false;

    if (cakeWrapper && micPermissionBtn) {

        const triggerBlowOutSequence = () => {
            if (cakeBlown) return;
            cakeBlown = true;
            if (cakeInstruction) cakeInstruction.innerText = "Wish granted ✨";

            // Flame extinguishing animation
            if (candleFlame) candleFlame.classList.add("extinguishing");

            // Create smoke wisps
            for (let i = 0; i < 5; i++) {
                const wisp = document.createElement("div");
                wisp.classList.add("smoke-wisp", "active");
                wisp.style.setProperty("--rndX", Math.random());
                cakeWrapper.appendChild(wisp);
                setTimeout(() => wisp.remove(), 2000);
            }

            // Delay for cinematic effect while the flame shrinks and smoke rises
            setTimeout(() => {
                if (candleFlame) {
                    candleFlame.classList.remove("extinguishing");
                    candleFlame.classList.add("blown");
                }

                // Fade out the entire cake container smoothly instead of a blast
                const cakeContainer = document.getElementById("cakeContainer");
                if (cakeContainer) {
                    cakeContainer.style.transition = "opacity 1.5s ease-out, transform 1.5s ease-out";
                    cakeContainer.style.opacity = "0";
                    cakeContainer.style.transform = "translateY(10px) scale(0.95)";
                }

                // Hide it fully after fade and reveal the next items
                setTimeout(() => {
                    if (cakeContainer) {
                        cakeContainer.classList.add("hidden");
                        cakeContainer.style.display = "none";
                    }

                    const elementsToFadeIn = [
                        document.getElementById("wishReveal"),
                        document.querySelector(".letter-body"),
                        document.getElementById("chapterNav"),
                        document.querySelector(".nav-controls-group")
                    ];

                    elementsToFadeIn.forEach(el => {
                        if (el) {
                            // Set initial state for fade in before removing hidden
                            el.style.opacity = "0";
                            el.style.transition = "none";

                            // Remove hidden so it becomes visible in the layout engine
                            el.classList.remove("hidden");
                            if (el.style.display === "none") el.style.display = "";

                            // Force reflow (flush CSS changes)
                            void el.offsetWidth;

                            // Apply transitions and final states (animate opacity only so we don't break CSS transforms like translateX(-50%))
                            el.style.transition = "opacity 1.5s ease-in-out";
                            el.style.opacity = "1";
                        }
                    });

                    // Reveal chapters navigation internal elements (staggered animation for the dots)
                    const chapterNav = document.getElementById("chapterNav");
                    if (chapterNav) {
                        const hops = chapterNav.querySelectorAll(".nav-hop");
                        hops.forEach((hop, index) => {
                            setTimeout(() => hop.classList.add("revealed"), (index * 120) + 100);
                        });
                    }
                }, 1500); // Wait 1.5s for the fade-out to complete

            }, 800); // Wait for the flame to fully shrink first
        };

        micPermissionBtn.addEventListener("click", async () => {
            try {
                // Browsers require HTTPS or localhost to access the microphone.
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Microphone API is restricted. (Requires HTTPS or localhost)");
                }

                let stream;
                try {
                    // Attempt 1: Request raw audio without noise cancellation
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
                    });
                } catch (e) {
                    // Attempt 2: Fallback to basic audio request if the mobile device rejects the constraints
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                }

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Fix for iOS Safari: resume context after user interaction
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                const microphone = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                microphone.connect(analyser);

                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                micPermissionBtn.classList.add("hidden");
                if (cakeInstruction) cakeInstruction.innerText = "Listening... Blow gently into the microphone! 💨";

                let blowFrames = 0;

                const checkBlow = () => {
                    if (cakeBlown) return;
                    analyser.getByteFrequencyData(dataArray);

                    // Wind noise (blowing) registers heavily in the lowest frequencies
                    let sum = 0;
                    for (let i = 0; i < 15; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / 15;

                    // Threshold to detect blowing
                    if (average > 40) {
                        blowFrames++;
                    } else {
                        blowFrames = Math.max(0, blowFrames - 1);
                    }

                    // Require sustained blow for a short duration
                    if (blowFrames > 12) {
                        // Successfully detected a sustained blow!
                        stream.getTracks().forEach(track => track.stop()); // Stop listening
                        triggerBlowOutSequence();
                    } else {
                        requestAnimationFrame(checkBlow);
                    }
                };

                checkBlow();

            } catch (err) {
                console.error("Microphone access denied or unsupported", err);
                if (cakeInstruction) {
                    if (err.message.includes("HTTPS")) {
                        cakeInstruction.innerText = "Microphone requires HTTPS/Localhost. You can tap the cake to make your wish!";
                    } else {
                        cakeInstruction.innerText = "Microphone access denied. You can tap the cake to make your wish!";
                    }
                }
                micPermissionBtn.classList.add("hidden");
                // Fallback to tap if mic fails
                cakeWrapper.addEventListener("click", triggerBlowOutSequence);
            }
        });

        // Manual click hint
        cakeWrapper.addEventListener("click", () => {
            if (cakeBlown || micPermissionBtn.classList.contains("hidden")) return;
            if (cakeInstruction) cakeInstruction.innerText = "Please click 'Allow Microphone' first to blow out the candle 🎤";
        });
    }

    // Proposal box confirmation and typewriter typing reveal feature
    const confirmReadyBtn = document.getElementById("confirmReadyBtn");
    const proposalConfirmCard = document.getElementById("proposalConfirmCard");
    const proposalLongText = document.querySelector(".proposal-long-text");
    const proposalBoxContainer = document.querySelector(".proposal-box-container");
    const proposalReveal = document.getElementById("proposalReveal");
    const responseCard = document.querySelector(".response-card");

    if (confirmReadyBtn && proposalConfirmCard && proposalLongText) {
        // Cache the original text of the paragraphs
        const paragraphElements = Array.from(proposalLongText.querySelectorAll("p"));
        const paragraphTexts = paragraphElements.map(p => p.textContent);

        confirmReadyBtn.addEventListener("click", () => {
            // Hide the confirmation card
            proposalConfirmCard.classList.add("hidden");

            // Show the proposal text container
            proposalLongText.classList.remove("hidden");

            // Typewriter effect function
            let pIndex = 0;
            let charIndex = 0;
            proposalLongText.innerHTML = ""; // Clear existing text

            let currentParagraphElement = null;

            function typeCharacter() {
                if (pIndex < paragraphTexts.length) {
                    if (charIndex === 0) {
                        currentParagraphElement = document.createElement("p");
                        proposalLongText.appendChild(currentParagraphElement);
                    }

                    const currentText = paragraphTexts[pIndex];
                    currentParagraphElement.textContent += currentText[charIndex];
                    charIndex++;

                    if (charIndex < currentText.length) {
                        setTimeout(typeCharacter, 25); // Typing speed
                    } else {
                        pIndex++;
                        charIndex = 0;
                        setTimeout(typeCharacter, 600); // Small pause between paragraphs
                    }
                } else {
                    // Typing complete, reveal envelope box and response card
                    if (proposalBoxContainer) {
                        proposalBoxContainer.classList.remove("hidden");
                        proposalBoxContainer.style.opacity = "0";
                        proposalBoxContainer.style.transition = "opacity 1.2s ease";

                        if (proposalReveal) {
                            proposalReveal.classList.remove("hidden");
                        }

                        setTimeout(() => {
                            proposalBoxContainer.style.opacity = "1";
                            const envelope = proposalBoxContainer.querySelector(".proposal-envelope");
                            setTimeout(() => {
                                if (envelope) envelope.classList.add("open");
                            }, 300); // Allow brief delay for fade-in before opening flap
                        }, 50);
                    }
                    if (responseCard) {
                        responseCard.classList.remove("hidden");
                        responseCard.style.opacity = "0";
                        responseCard.style.transition = "opacity 1.2s ease";
                        setTimeout(() => {
                            responseCard.style.opacity = "1";
                            letterUnlocked = true;
                            const nextBtnElement = document.getElementById("nextBtn");
                            if (nextBtnElement) {
                                nextBtnElement.classList.remove("hidden");
                            }
                        }, 50);
                    }
                }
            }

            // Start the typing transition
            typeCharacter();
        });
    }
}

/**
 * STAGGERED PAGE CONTENT REVEAL ENGINE
 * Staggers the fade-in and slide-up of page container children for premium transitions
 */
function triggerStaggeredReveal(pageDOM) {
    if (!pageDOM) return;

    // Find all visual blocks we want to stagger.
    // If it's a page containing a timeline, we want to stagger the timeline cards instead of the container itself!
    let targets = [];
    const timelineContainer = pageDOM.querySelector('.vertical-timeline-engine, .admire-vertical-timeline');

    if (timelineContainer) {
        // Page has a timeline! Stagger the title first, then the timeline container itself, then each card in the timeline sequentially
        const titles = Array.from(pageDOM.querySelectorAll('.content-container > h1, .content-container > h2, .content-container > p.section-subtitle'));
        const cards = Array.from(timelineContainer.querySelectorAll('.timeline-node-card, .admire-node-card'));
        targets = [...titles, timelineContainer, ...cards];
    } else {
        // Normal page - stagger direct children
        targets = Array.from(pageDOM.querySelectorAll(
            '.content-container > h1, .content-container > h2, .content-container > h3, .content-container > .glass-panel, .content-container > .glass-panel-main, .content-container > .story-card, .content-container > .gallery-grid, .content-container > .response-card, .content-container > .celebration-card, .content-container > .cake-wish-container, .content-container > .proposal-confirm-card, .content-container > .proposal-long-text, .content-container > .proposal-box-container'
        ));
    }

    // Reset them to hidden stagger state
    targets.forEach(el => {
        el.classList.add('stagger-item');
        el.classList.remove('revealed');
    });

    // Trigger sequence with dynamic delay
    targets.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('revealed');
        }, index * 200); // 200ms stagger offset
    });
}

/**
 * IMAGE FALLBACK ENGINE
 * Automatically replaces missing/broken images with beautiful inline SVG placeholders
 * designed matching the luxury dark pink romance theme.
 */
function initImageFallbackEngine() {
    const goldGlow = "rgba(255, 143, 163, 0.4)";
    const darkVelvet = "#1a0b10";
    const roseGold = "#ff8fa3";
    const softCream = "#ffe3e8";

    const fallbacks = {
        'girl-dp15.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><defs><radialGradient id="grad1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#4a1a26"/><stop offset="100%" stop-color="${darkVelvet}"/></radialGradient></defs><rect width="200" height="200" fill="url(#grad1)"/><circle cx="100" cy="100" r="70" fill="none" stroke="${roseGold}" stroke-width="2" stroke-dasharray="4 4"/><path d="M100 50 C112 50 120 58 120 70 C120 82 112 90 100 90 C88 90 80 82 80 70 C80 58 88 50 100 50 Z M100 100 C75 100 60 115 60 135 L140 135 C140 115 125 100 100 100 Z" fill="${roseGold}" opacity="0.8"/><path d="M100 35 L105 45 L115 45 L107 51 L110 61 L100 55 L90 61 L93 51 L85 45 L95 45 Z" fill="${softCream}" opacity="0.9" transform="scale(0.5) translate(100, 30)"/></svg>`,
        'girl-dp1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3a151f"/><text x="50%" y="55%" font-family="'Poppins', sans-serif" font-size="64px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">🌸</text></svg>`,
        'girl-dp2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3d1822"/><text x="50%" y="55%" font-family="'Poppins', sans-serif" font-size="64px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">✨</text></svg>`,
        'girl-dp3.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#421a25"/><text x="50%" y="55%" font-family="'Poppins', sans-serif" font-size="64px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">💖</text></svg>`,
        'girl-dp4.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#35131b"/><text x="50%" y="55%" font-family="'Poppins', sans-serif" font-size="64px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">👑</text></svg>`,
        'childhood.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="100%" height="100%"><rect width="200" height="130" fill="#2d131b"/><circle cx="100" cy="65" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5"/><text x="50%" y="53%" font-family="'Poppins', sans-serif" font-size="28px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">👶</text><text x="50%" y="82%" font-family="'Poppins', sans-serif" font-size="10px" fill="${roseGold}" text-anchor="middle" letter-spacing="1">BORN INTO LIGHT</text></svg>`,
        'school.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="100%" height="100%"><rect width="200" height="130" fill="#291119"/><circle cx="100" cy="65" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5"/><text x="50%" y="53%" font-family="'Poppins', sans-serif" font-size="28px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">🏫</text><text x="50%" y="82%" font-family="'Poppins', sans-serif" font-size="10px" fill="${roseGold}" text-anchor="middle" letter-spacing="1">SCHOOL DAYS</text></svg>`,
        'college.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="100%" height="100%"><rect width="200" height="130" fill="#2f141d"/><circle cx="100" cy="65" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5"/><text x="50%" y="53%" font-family="'Poppins', sans-serif" font-size="28px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">🎓</text><text x="50%" y="82%" font-family="'Poppins', sans-serif" font-size="10px" fill="${roseGold}" text-anchor="middle" letter-spacing="1">COLLEGE LIFE</text></svg>`,
        'career.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="100%" height="100%"><rect width="200" height="130" fill="#250f16"/><circle cx="100" cy="65" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5"/><text x="50%" y="53%" font-family="'Poppins', sans-serif" font-size="28px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">💼</text><text x="50%" y="82%" font-family="'Poppins', sans-serif" font-size="10px" fill="${roseGold}" text-anchor="middle" letter-spacing="1">CAREER MILESTONE</text></svg>`,
        'present.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="100%" height="100%"><rect width="200" height="130" fill="#321520"/><circle cx="100" cy="65" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5"/><text x="50%" y="53%" font-family="'Poppins', sans-serif" font-size="28px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">🌸</text><text x="50%" y="82%" font-family="'Poppins', sans-serif" font-size="10px" fill="${roseGold}" text-anchor="middle" letter-spacing="1">PRESENT DAY</text></svg>`,
        'family1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3b1723"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">🏡</text><text x="50%" y="75%" font-family="'Poppins', sans-serif" font-size="16px" fill="${softCream}" text-anchor="middle" opacity="0.9">Family Anchor</text></svg>`,
        'family2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#33121d"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">👨‍👩‍👧</text><text x="50%" y="75%" font-family="'Poppins', sans-serif" font-size="16px" fill="${softCream}" text-anchor="middle" opacity="0.9">Love & Support</text></svg>`,
        'parents.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3d1926"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">❤️</text><text x="50%" y="75%" font-family="'Poppins', sans-serif" font-size="16px" fill="${softCream}" text-anchor="middle" opacity="0.9">Parents' Guidance</text></svg>`,
        'memorial.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="100%"><rect width="400" height="280" fill="#1b0811"/><circle cx="200" cy="140" r="70" fill="none" stroke="${roseGold}" stroke-width="1" opacity="0.3"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="56px" fill="${softCream}" text-anchor="middle" dominant-baseline="middle">🕊️</text><text x="50%" y="75%" font-family="'Poppins', sans-serif" font-size="16px" fill="${roseGold}" text-anchor="middle" opacity="0.9" letter-spacing="2">ALWAYS BY YOUR SIDE</text></svg>`,
        'admire1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#381521"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">😊</text></svg>`,
        'admire2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#2d0f19"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">💪</text></svg>`,
        'admire3.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3a1622"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">❤️</text></svg>`,
        'admire4.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#2f111b"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">✨</text></svg>`,
        'admire5.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#35131f"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">🌻</text></svg>`,
        'us1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="100%" height="100%"><rect width="280" height="280" fill="#32121d"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">💞</text><text x="50%" y="70%" font-family="'Poppins', sans-serif" font-size="14px" fill="${softCream}" text-anchor="middle">How We Met</text></svg>`,
        'us2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="100%" height="100%"><rect width="280" height="280" fill="#2c0e18"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">😂</text><text x="50%" y="70%" font-family="'Poppins', sans-serif" font-size="14px" fill="${softCream}" text-anchor="middle">Inside Jokes</text></svg>`,
        'us3.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="100%" height="100%"><rect width="280" height="280" fill="#381523"/><text x="50%" y="45%" font-family="'Poppins', sans-serif" font-size="54px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">💬</text><text x="50%" y="70%" font-family="'Poppins', sans-serif" font-size="14px" fill="${softCream}" text-anchor="middle">Late Night Chats</text></svg>`,
        'us-photo1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3a1622"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">📸</text></svg>`,
        'us-screenshot1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#31101b"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">💬</text></svg>`,
        'us-photo2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%"><rect width="200" height="200" fill="#3e1927"/><text x="50%" y="50%" font-family="'Poppins', sans-serif" font-size="48px" fill="${roseGold}" text-anchor="middle" dominant-baseline="middle">🌟</text></svg>`,

        // Navigation Icons
        'nav-ch1.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#3a151f"/><path d="M25 70 h50 v10 h-50 z" fill="${roseGold}"/><path d="M30 50 h40 v20 h-40 z" fill="#ad536d"/><rect x="48" y="35" width="4" height="15" fill="${softCream}" rx="1"/><path d="M50 25 c-2 3 -2 7 0 10 c2 -3 2 -7 0 -10" fill="#ffea00"/></svg>`,
        'nav-ch2.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#3d1822"/><path d="M50 75 C15 45 30 20 50 38 C70 20 85 45 50 75 Z" fill="${roseGold}"/><circle cx="25" cy="25" r="1.5" fill="${softCream}"/><circle cx="75" cy="25" r="1.5" fill="${softCream}"/></svg>`,
        'nav-ch3.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#421a25"/><path d="M50 15 L53 25 L63 25 L55 31 L58 41 L50 35 L42 41 L45 31 L37 25 L47 25 Z" fill="${softCream}"/><path d="M20 85 Q50 65 50 35" fill="none" stroke="${roseGold}" stroke-width="3" stroke-dasharray="3 3"/></svg>`,
        'nav-ch4.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#35131b"/><path d="M35 75 v-20 l15 -10 l15 10 v20 z" fill="#ad536d"/><path d="M50 35 C40 20 25 35 50 55 C75 35 60 20 50 35 Z" fill="none" stroke="${roseGold}" stroke-width="2"/></svg>`,
        'nav-ch5.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#2d131b"/><path d="M50 20 L55 38 L73 38 L58 48 L63 66 L50 55 L37 66 L42 48 L27 38 L45 38 Z" fill="${softCream}"/><circle cx="50" cy="46" r="30" fill="none" stroke="${roseGold}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/></svg>`,
        'nav-ch6.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#291119"/><path d="M25 65 L30 40 L43 55 L50 35 L57 55 L70 40 L75 65 Z" fill="${roseGold}"/><rect x="25" y="70" width="50" height="6" fill="${softCream}" rx="2"/></svg>`,
        'nav-ch7.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#2f141d"/><path d="M20 40 Q50 30 80 40 v35 Q50 65 20 75 Z" fill="#ad536d"/><path d="M50 40 v30" stroke="${softCream}" stroke-width="2"/><path d="M30 48 h12 M30 56 h12 M58 48 h12 M58 56 h12" stroke="${softCream}" stroke-width="1.5"/></svg>`,
        'nav-ch8.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#250f16"/><path d="M20 35 h60 v35 h-60 z" fill="#ad536d" stroke="${roseGold}" stroke-width="1.5"/><path d="M20 35 L50 55 L80 35" fill="none" stroke="${softCream}" stroke-width="1.5"/><path d="M50 60 C46 54 40 58 50 65 C60 58 54 54 50 60 Z" fill="${roseGold}"/></svg>`,
        'nav-ch9.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="#321520"/><path d="M60 30 A 25 25 0 1 0 70 70 A 30 30 0 1 1 60 30 Z" fill="${softCream}"/><circle cx="35" cy="30" r="2" fill="${roseGold}"/><circle cx="45" cy="40" r="1.5" fill="${roseGold}"/><circle cx="30" cy="55" r="2.5" fill="${roseGold}"/></svg>`,

        // Timeline Markers
        'marker-born.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="#2d131b" rx="25"/><circle cx="25" cy="20" r="6" fill="${roseGold}"/><path d="M15 35 Q 25 28 35 35" stroke="${roseGold}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
        'marker-school.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="#291119" rx="25"/><path d="M15 22 L25 15 L35 22 V37 H15 Z" fill="#ad536d"/><rect x="22" y="28" width="6" height="9" fill="${softCream}"/></svg>`,
        'marker-college.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="#2f141d" rx="25"/><path d="M25 15 L38 22 L25 29 L12 22 Z" fill="${roseGold}"/><path d="M18 25.5 V31.5 C20 34.5 30 34.5 32 31.5 V25.5" fill="none" stroke="${roseGold}" stroke-width="2"/></svg>`,
        'marker-career.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="#250f16" rx="25"/><path d="M15 22 H35 V38 H15 Z" fill="#ad536d"/><path d="M22 17 H28 V22 H22 Z" fill="none" stroke="${roseGold}" stroke-width="2"/></svg>`,
        'marker-present.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="#321520" rx="25"/><path d="M25 15 L28 23 L36 23 L30 28 L32 36 L25 31 L18 36 L20 28 L14 23 L22 23 Z" fill="${softCream}"/></svg>`,

        // Decorative Chapter Headers
        'chapter5-header.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="100%" height="100%"><rect width="150" height="150" fill="none"/><path d="M75 120 C70 90 20 80 20 50 C20 30 40 20 60 40 C68 48 72 60 75 70 C78 60 82 48 90 40 C110 20 130 30 130 50 C130 80 80 90 75 120 Z" fill="${roseGold}" opacity="0.9"/><path d="M75 110 C72 85 30 75 30 50 C30 35 45 28 60 42 C67 49 71 60 75 68 C79 60 83 49 90 42 C105 28 120 35 120 50 C120 85 78 85 75 110 Z" fill="${softCream}"/></svg>`,
        'chapter8-header.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="none"/><path d="M50 25 C45 10 20 15 35 35 C50 50 50 50 50 50 C50 50 50 50 65 35 C80 15 55 10 50 25 Z" fill="${roseGold}"/><path d="M50 30 C47 20 30 22 40 33 C50 43 50 43 50 43 C50 43 50 43 60 33 C70 22 53 20 50 30 Z" fill="${softCream}"/><path d="M50 50 V75" stroke="${roseGold}" stroke-width="2.5"/><path d="M50 58 Q40 58 42 54" stroke="${roseGold}" stroke-width="2" fill="none"/><path d="M50 66 Q60 66 58 62" stroke="${roseGold}" stroke-width="2" fill="none"/></svg>`,
        'chapter9-header.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="none"/><path d="M60 20 A 30 30 0 1 0 70 80 A 35 35 0 1 1 60 20 Z" fill="${softCream}" filter="drop-shadow(0 0 6px ${roseGold})"/></svg>`,
        'envelope-heart.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><rect width="50" height="50" fill="none"/><path d="M25 40 C10 25 15 10 25 20 C35 10 40 25 25 40 Z" fill="${roseGold}"/></svg>`,

        // Inline / Content Level Emojis
        'heading-spark.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="${roseGold}"/></svg>`,
        'content-spark.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="${roseGold}"/></svg>`,
        'content-flower.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="4" fill="${roseGold}"/><circle cx="12" cy="5" r="4" fill="${softCream}"/><circle cx="12" cy="19" r="4" fill="${softCream}"/><circle cx="5" cy="12" r="4" fill="${softCream}"/><circle cx="19" cy="12" r="4" fill="${softCream}"/></svg>`,
        'content-heart.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21 C-2 13 3 4 12 8.5 C21 4 26 13 12 21 Z" fill="${roseGold}"/></svg>`,
        'content-crown.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M2 19 L4 8 L9 13 L12 5 L15 13 L20 8 L22 19 Z" fill="${roseGold}" stroke="${softCream}" stroke-width="1"/></svg>`,
        'wish-heart.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 85 C-10 50 10 15 50 35 C90 15 110 50 50 85 Z" fill="${roseGold}" filter="drop-shadow(0 0 8px rgba(255, 143, 163, 0.6))"/></svg>`,
        'cake-icon.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><rect x="4" y="12" width="16" height="8" rx="2" fill="#ad536d"/><rect x="6" y="8" width="12" height="4" rx="1" fill="${roseGold}"/><line x1="12" y1="4" x2="12" y2="8" stroke="${softCream}" stroke-width="2"/><circle cx="12" cy="3" r="1.5" fill="#ffea00"/></svg>`,
        'nav-photos.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="${roseGold}" stroke-width="2"/><circle cx="8.5" cy="9.5" r="1.5" fill="${roseGold}"/><path d="M5 17 L9 13 L12 16 L16 11 L19 17 Z" fill="${roseGold}"/></svg>`,
        'nav-smile.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><circle cx="12" cy="12" r="10" fill="none" stroke="${roseGold}" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="${roseGold}"/><circle cx="15.5" cy="8.5" r="1.5" fill="${roseGold}"/><path d="M8 14 Q12 18 16 14" fill="none" stroke="${roseGold}" stroke-width="2" stroke-linecap="round"/></svg>`,
        'nav-heart.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21 C-2 13 3 4 12 8.5 C21 4 26 13 12 21 Z" fill="${roseGold}"/></svg>`,
        'nav-spark.jpg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="${roseGold}"/></svg>`
    };

    document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || '';
        const key = Object.keys(fallbacks).find(k => src.endsWith(k));

        img.addEventListener('error', function handleErr() {
            if (key && fallbacks[key]) {
                this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(fallbacks[key]);
            } else {
                this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="${darkVelvet}"/><path d="M50 30 C35 15 15 35 50 75 C85 35 65 15 50 30 Z" fill="${roseGold}" opacity="0.5"/></svg>`);
            }
            this.removeEventListener('error', handleErr);
        });

        // Trigger manually if naturalWidth is 0 (already failed or cached as failed)
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
}