document.addEventListener("DOMContentLoaded", () => {
    initSecureGateway();
    initNavigationEngine();
    initFloatingAudioEngine();
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
                bgMusic.volume = 0.4; // Sets a soft, elegant background ambient volume scale (0.0 to 1.0)
                bgMusic.play().catch(error => {
                    console.log("Audio autoplay restriction handled seamlessly:", error);
                });
                // Sync floating control button state if it exists
                const toggleBtn = document.getElementById("audioToggleBtn");
                if (toggleBtn) toggleBtn.innerHTML = "⏸ Pause";
            }

            // Grant entry clearance with programmatic fade routing
            loginScreen.classList.add("fade-out");
            appContainer.classList.remove("hidden");
            window.scrollTo({ top: 0 });
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
    const totalMainPages = 3;
    let currentSubIndex = 0; 
    const subKeys = ['a', 'b', 'c'];
    let particleInterval = null;
    
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const bgImage = document.getElementById("app-background");
    const hopElements = document.querySelectorAll(".nav-hop");
    const subNavButtons = document.querySelectorAll(".sub-nav-btn");
    const subPages = document.querySelectorAll(".sub-page");

    const DOMPages = {
        1: document.getElementById("page1"),
        2: document.getElementById("page2"),
        3: document.getElementById("page3")
    };

    /**
     * SYNCHRONIZE SUB-CHAPTER PANELS
     */
    function synchronizeSubChapters() {
        const activeKey = subKeys[currentSubIndex];
        
        subNavButtons.forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-sub") === activeKey);
        });

        subPages.forEach(page => {
            if (page.id === `sub-page-${activeKey}`) {
                page.classList.add("active");
                page.style.position = "relative"; // Locks card back into native page height workflow
            } else {
                page.classList.remove("active");
                page.style.position = "absolute"; 
            }
        });
    }

    function changeMainPage(targetPage, flowDirection = 'neutral') {
        if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }

        DOMPages[currentMainPage].classList.remove("active");
        currentMainPage = targetPage;
        DOMPages[currentMainPage].classList.add("active");
        
        if (currentMainPage === 2) {
            currentSubIndex = flowDirection === 'forward' ? 0 : subKeys.length - 1;
            synchronizeSubChapters();
        }

        hopElements.forEach(hop => {
            hop.classList.toggle("active", parseInt(hop.getAttribute("data-target")) === currentMainPage);
        });

        evaluateButtonDisplayStates();
        
        // Locked-bounds scale parameter prevents the image edges from revealing the velvet background
        const translateXValue = (currentMainPage - 1) * -5; 
        bgImage.style.transform = `scale(1.15) translate(${translateXValue}px, 0px)`;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function evaluateButtonDisplayStates() {
        prevBtn.classList.toggle("hidden", currentMainPage === 1);
        if (currentMainPage === totalMainPages) {
            nextBtn.classList.add("hidden");
            spawnProceduralFloralParticles();
        } else {
            nextBtn.classList.remove("hidden");
        }
    }

    nextBtn.addEventListener("click", () => {
        if (currentMainPage === 2 && currentSubIndex < subKeys.length - 1) {
            currentSubIndex++;
            synchronizeSubChapters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (currentMainPage < totalMainPages) changeMainPage(currentMainPage + 1, 'forward');
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentMainPage === 2 && currentSubIndex > 0) {
            currentSubIndex--;
            synchronizeSubChapters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            currentSubIndex = subKeys.indexOf(button.getAttribute("data-sub"));
            synchronizeSubChapters();
        });
    });

    function spawnProceduralFloralParticles() {
        const stage = document.getElementById("rose-shower-container");
        if (!stage) return;
        let itemCounter = 0;
        const completeLimit = 25;

        particleInterval = setInterval(() => {
            if (itemCounter >= completeLimit || currentMainPage !== 3) {
                clearInterval(particleInterval);
                return;
            }

            const cleanPetal = document.createElement("div");
            cleanPetal.classList.add("minimal-rose");
            cleanPetal.innerText = "🌹";
            cleanPetal.style.left = `${10 + Math.random() * 80}vw`;
            
            const internalSpeed = 4.5 + Math.random() * 3.0;
            cleanPetal.style.animationDuration = `${internalSpeed}s`;
            cleanPetal.style.fontSize = `${1.0 + Math.random() * 0.5}rem`;
            
            stage.appendChild(cleanPetal);
            itemCounter++;

            setTimeout(() => { cleanPetal.remove(); }, internalSpeed * 1000);
        }, 450);
    }
}

/**
 * DRAGGABLE, COLLAPSIBLE FLOATING AUDIO ENGINE
 */
function initFloatingAudioEngine() {
    const pod = document.getElementById("musicPod");
    const triggerIcon = document.getElementById("podTriggerIcon");
    const toggleBtn = document.getElementById("audioToggleBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const bgMusic = document.getElementById("bgMusic");

    if (!pod || !bgMusic) return;

    let isDragging = false;
    let dragStartX, dragStartY;
    let podStartX, podStartY;
    let hasMoved = false;

    // --- Core Audio Operations ---
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Stop panel from closing back down
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                toggleBtn.innerHTML = "⏸ Pause";
            });
        } else {
            bgMusic.pause();
            toggleBtn.innerHTML = "▶ Play";
        }
    });

    volumeSlider.addEventListener("input", (e) => {
        bgMusic.volume = e.target.value;
    });
    
    volumeSlider.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid closing panel during adjustments
    });

    // --- Expand / Collapse Logic ---
    pod.addEventListener("click", () => {
        if (!hasMoved) {
            pod.classList.toggle("expanded");
        }
    });

    // --- Fluid Pointer Drag Controls ---
    const startDrag = (clientX, clientY) => {
        isDragging = true;
        hasMoved = false;
        dragStartX = clientX;
        dragStartY = clientY;
        
        const rect = pod.getBoundingClientRect();
        podStartX = rect.left;
        podStartY = rect.top;
        
        pod.style.transition = "none"; // Temporarily disable smooth animations during manual movement
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

        // Visual Boundary Collision Safety Rules
        const padding = 15;
        targetX = Math.max(padding, Math.min(window.innerWidth - pod.offsetWidth - padding, targetX));
        targetY = Math.max(padding, Math.min(window.innerHeight - pod.offsetHeight - padding, targetY));

        pod.style.left = `${targetX}px`;
        pod.style.top = `${targetY}px`;
        pod.style.bottom = "auto";
        pod.style.right = "auto";
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        pod.style.transition = "max-width 0.4s cubic-bezier(0.23, 1, 0.32, 1), padding 0.4s, background-color 0.3s";
    };

    // Mouse Handling Integration
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

    // Touch Screen Device Compatibility
    pod.addEventListener("touchstart", (e) => {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    pod.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        doDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    pod.addEventListener("touchend", stopDrag);
}