document.addEventListener("DOMContentLoaded", () => {
    initExperienceControls();
    initAudioController();
});

let currentSceneIndex = 1;
const totalScenesCount = 7; 
let bgMusic;
let sparkleShowerTriggered = false;

function initExperienceControls() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    prevBtn.addEventListener("click", () => {
        if (currentSceneIndex > 1) {
            transitionToScene(currentSceneIndex - 1, "backward");
        }
    });

    nextBtn.addEventListener("click", () => {
        tryToPlayMusic();
        if (currentSceneIndex < totalScenesCount) {
            transitionToScene(currentSceneIndex + 1, "forward");
        }
    });
}

function transitionToScene(targetIdx, direction) {
    const currentCard = document.getElementById(`scene${currentSceneIndex}`);
    const targetCard = document.getElementById(`scene${targetIdx}`);
    
    // Trigger clean modern out-fade transition
    currentCard.classList.add("exit-fade");

    setTimeout(() => {
        currentCard.classList.remove("active", "exit-fade");
        targetCard.classList.add("active");
        
        currentSceneIndex = targetIdx;
        document.getElementById("currentStep").innerText = currentSceneIndex;
        
        // Handle dynamic image metamorphosis blur updates natively
        updateBackgroundOverlayState(targetCard.getAttribute("data-bg"));

        // Ambient layout validation adjustments
        if (currentSceneIndex === totalScenesCount && !sparkleShowerTriggered) {
            triggerAmbientSparkleShower();
            sparkleShowerTriggered = true;
        }
    }, 400); // Transitions seamlessly mid-fade out loop execution window
}

function jumpToScene(targetIdx) {
    tryToPlayMusic();
    if (targetIdx !== currentSceneIndex && targetIdx <= totalScenesCount) {
        const direction = targetIdx > currentSceneIndex ? "forward" : "backward";
        transitionToScene(targetIdx, direction);
    }
}

function updateBackgroundOverlayState(bgType) {
    const bgContainer = document.getElementById("app-background");
    if (!bgContainer) return;

    // Reset current utility target mappings cleanly
    bgContainer.className = "";

    if (bgType === "sharp") {
        bgContainer.classList.add("bg-focus-sharp");
    } else if (bgType === "blur-light") {
        bgContainer.classList.add("bg-blur-light");
    } else if (bgType === "blur-heavy") {
        bgContainer.classList.add("bg-blur-heavy");
    } else if (bgType === "sharp-dark") {
        bgContainer.classList.add("bg-sharp-dark");
    }
}

function triggerAmbientSparkleShower() {
    const container = document.getElementById("particle-container");
    const layoutElements = ["✨", "✨", "⭐", "🌸"]; 
    
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const element = document.createElement("div");
            element.classList.add("ambient-sparkle");
            element.innerText = layoutElements[Math.floor(Math.random() * layoutElements.length)];
            element.style.left = `${Math.random() * 100}vw`;
            
            const dynamicSpeed = 4.5 + Math.random() * 3.5;
            element.style.animationDuration = `${dynamicSpeed}s`;
            element.style.fontSize = `${0.7 + Math.random() * 1.0}rem`;
            
            container.appendChild(element);
            setTimeout(() => element.remove(), dynamicSpeed * 1000);
        }, i * 85);
    }
}

function initAudioController() {
    bgMusic = document.getElementById("bgMusic");
    const toggleBtn = document.getElementById("musicToggleBtn");
    
    if(!bgMusic || !toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play();
            toggleBtn.innerHTML = "🎵 Mute";
            toggleBtn.classList.remove("muted");
        } else {
            bgMusic.pause();
            toggleBtn.innerHTML = "🔇 Play Music";
            toggleBtn.classList.add("muted");
        }
    });
}

function tryToPlayMusic() {
    if (bgMusic && bgMusic.paused && !document.getElementById("musicToggleBtn").classList.contains("muted")) {
        bgMusic.play().then(() => {
            document.getElementById("musicToggleBtn").innerHTML = "🎵 Mute";
        }).catch(() => {
            /* Structural safeguard: waits cleanly for safe direct window click targeting */
        });
    }
}