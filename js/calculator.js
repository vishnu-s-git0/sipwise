/**
 * Sipwise — Coffee Brew Ratio & Live Pour Assistant
 *
 * Concepts covered:
 * 1. Proportional brewing mathematics (Dose * Ratio = Water Weight).
 * 2. Precision timer using requestAnimationFrame or setInterval with elapsed time calculation.
 * 3. Dynamic step-by-step timed cues and progress bar animation.
 * 4. Audio synthesis via Web Audio API (zero external sound dependencies).
 */

(function () {
    // 1. Equipment Profiles & Timed Stage Definitions
    const gearProfiles = {
        v60: {
            name: "Hario V60 Pour-Over",
            ratio: 15,
            defaultDose: 15,
            temp: "92°C – 94°C",
            grind: "Medium-Fine",
            totalTime: 180, // seconds
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 45,
                    title: "Phase 1: The Bloom",
                    desc: `Pour ${Math.round(dose * 3)}g of water in steady spirals. Let the coffee bubble for 45s to release CO₂.`,
                    targetWeight: `${Math.round(dose * 3)}g`
                },
                {
                    start: 45,
                    end: 90,
                    title: "Phase 2: First Pour",
                    desc: `Pour steadily in concentric circles without touching the paper edges, bringing the total water to ${Math.round(totalWater * 0.6)}g.`,
                    targetWeight: `${Math.round(totalWater * 0.6)}g`
                },
                {
                    start: 90,
                    end: 135,
                    title: "Phase 3: Final Pour",
                    desc: `Gently pour remaining water in steady circles up to the final target of ${totalWater}g.`,
                    targetWeight: `${totalWater}g`
                },
                {
                    start: 135,
                    end: 180,
                    title: "Phase 4: Draw-down",
                    desc: "Give the brewer one gentle swirl for a flat bed. Allow gravity to complete the drawdown.",
                    targetWeight: "Allow drawdown"
                }
            ]
        },
        "south-indian-filter": {
            name: "South Indian Filter",
            ratio: 5,
            defaultDose: 30,
            temp: "100°C (Rolling Boil)",
            grind: "Fine / Chicory Blend",
            totalTime: 600,
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 60,
                    title: "Phase 1: Assemble & Pour",
                    desc: `Add ${dose}g coffee to top chamber, place umbrella disc gently, and pour ${totalWater}g boiling water. Cover with lid.`,
                    targetWeight: `${totalWater}g`
                },
                {
                    start: 60,
                    end: 600,
                    title: "Phase 2: Gravity Decollection",
                    desc: "Boiling water is slowly extracting through the grounds into the bottom vessel to create rich, syrupy decoction.",
                    targetWeight: "Decocting..."
                }
            ]
        },
        aeropress: {
            name: "AeroPress Brewer",
            ratio: 13,
            defaultDose: 15,
            temp: "86°C – 88°C",
            grind: "Medium-Fine",
            totalTime: 120,
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 30,
                    title: "Phase 1: Pour & Agitate",
                    desc: `Inverted method: Pour all ${totalWater}g hot water quickly onto ${dose}g grounds. Stir 5 times.`,
                    targetWeight: `${totalWater}g`
                },
                {
                    start: 30,
                    end: 90,
                    title: "Phase 2: Immersion Steep",
                    desc: "Rinse the paper filter inside the cap and screw it securely onto the chamber. Let it steep undisturbed.",
                    targetWeight: "Steeping"
                },
                {
                    start: 90,
                    end: 120,
                    title: "Phase 3: Flip & Gentle Press",
                    desc: "Flip onto your mug and press the plunger down slowly over 30s. Stop at the first gentle hiss!",
                    targetWeight: "Press over 30s"
                }
            ]
        },
        "french-press": {
            name: "French Press (Plunger)",
            ratio: 14,
            defaultDose: 20,
            temp: "94°C – 96°C",
            grind: "Coarse",
            totalTime: 270,
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 45,
                    title: "Phase 1: Saturate & Rest",
                    desc: `Pour all ${totalWater}g hot water vigorously over ${dose}g coarse coffee. Place lid on top with plunger raised.`,
                    targetWeight: `${totalWater}g`
                },
                {
                    start: 45,
                    end: 240,
                    title: "Phase 2: 4-Minute Steep",
                    desc: "Allow full immersion extraction to develop natural oils, sweetness, and heavy body.",
                    targetWeight: "Steeping"
                },
                {
                    start: 240,
                    end: 270,
                    title: "Phase 3: Crust Break & Plunge",
                    desc: "Gently stir the surface crust twice with a spoon so grounds settle. Press mesh filter down slowly.",
                    targetWeight: "Plunge gently"
                }
            ]
        },
        "moka-pot": {
            name: "Moka Pot (Stovetop)",
            ratio: 7,
            defaultDose: 18,
            temp: "Pre-heated Water",
            grind: "Medium-Fine",
            totalTime: 240,
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 180,
                    title: "Phase 1: Low Heat Rise",
                    desc: `Place pot on low-medium heat with lid open. Hot water (${totalWater}g) in base begins generating steam pressure.`,
                    targetWeight: "Heating on stove"
                },
                {
                    start: 180,
                    end: 240,
                    title: "Phase 2: Golden Stream",
                    desc: "Golden-hazel coffee streams smoothly into the top chamber. On first bubbling gurgle, remove from heat and cool base under cold tap!",
                    targetWeight: "Watch stream"
                }
            ]
        },
        "cold-brew": {
            name: "Cold Brew Dripper",
            ratio: 8,
            defaultDose: 50,
            temp: "Chilled / Room Temp",
            grind: "Extra Coarse",
            totalTime: 60,
            getSteps: (dose, totalWater) => [
                {
                    start: 0,
                    end: 60,
                    title: "Infusion Setup",
                    desc: `Combine ${dose}g extra-coarse grounds with ${totalWater}ml cold water. Stir gently, seal, and refrigerate for 14 to 16 hours.`,
                    targetWeight: `${totalWater}ml cold water`
                }
            ]
        }
    };

    // 2. State
    let currentGearKey = "v60";
    let currentDose = 15;
    let timerRunning = false;
    let timerSeconds = 0;
    let timerInterval = null;
    let currentStepIndex = -1;
    let soundEnabled = true;

    // 3. DOM Elements
    const gearButtons = document.querySelectorAll("#timerGearSelect .gear-btn");
    const doseInput = document.getElementById("coffeeDoseInput");
    const doseDisplay = document.getElementById("doseDisplay");
    const doseMinusBtn = document.getElementById("doseMinusBtn");
    const dosePlusBtn = document.getElementById("dosePlusBtn");
    const presetButtons = document.querySelectorAll(".dose-quick-presets .preset-btn");

    const waterWeightDisplay = document.getElementById("waterWeightDisplay");
    const ratioDisplay = document.getElementById("ratioDisplay");
    const tempDisplay = document.getElementById("tempDisplay");
    const grindDisplay = document.getElementById("grindDisplay");

    const timerClock = document.getElementById("timerClock");
    const timerProgressFill = document.getElementById("timerProgressFill");
    const timerPhaseBadge = document.getElementById("timerPhaseBadge");
    const soundToggleBtn = document.getElementById("soundToggleBtn");
    const cueTitle = document.getElementById("cueTitle");
    const cueDesc = document.getElementById("cueDesc");
    const cueWeightCallout = document.getElementById("cueWeightCallout");
    const startTimerBtn = document.getElementById("startTimerBtn");
    const resetTimerBtn = document.getElementById("resetTimerBtn");

    /**
     * Synthesize clean audio chime using Web Audio API
     */
    function playChime(isCompletion = false) {
        if (!soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            if (isCompletion) {
                // Two-tone celebratory chime (G5 -> C6)
                const playTone = (freq, time, dur) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, time);
                    gain.gain.setValueAtTime(0.2, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
                    osc.start(time);
                    osc.stop(time + dur);
                };
                playTone(783.99, ctx.currentTime, 0.25);
                playTone(1046.5, ctx.currentTime + 0.18, 0.45);
            } else {
                // Single step alert chime (D5 -> A5)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) {
            // Audio context not allowed or not supported
        }
    }

    /**
     * 4. Updates Calculated Values & UI
     */
    function updateCalculations() {
        const profile = gearProfiles[currentGearKey];
        if (!profile) return;

        const totalWater = Math.round(currentDose * profile.ratio);

        // Update display text
        doseDisplay.textContent = `${currentDose}g`;
        if (doseInput) doseInput.value = currentDose;
        waterWeightDisplay.textContent = `${totalWater}g`;
        ratioDisplay.textContent = `1:${profile.ratio}`;
        tempDisplay.textContent = profile.temp;
        grindDisplay.textContent = profile.grind;

        // If timer is not running, update preview cue
        if (!timerRunning && timerSeconds === 0) {
            const steps = profile.getSteps(currentDose, totalWater);
            const firstStep = steps[0];
            cueTitle.textContent = `${profile.name} Ready`;
            cueDesc.textContent = `Dose ${currentDose}g coffee and heat water to ${profile.temp}. Press Start Brew when pouring.`;
            cueWeightCallout.textContent = firstStep ? `First target: ${firstStep.targetWeight}` : `Target: ${totalWater}g`;
        }
    }

    /**
     * Formats seconds into MM:SS format
     */
    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    /**
     * 5. Timer Tick & Step Evaluation
     */
    function updateTimerUI() {
        timerClock.textContent = formatTime(timerSeconds);

        const profile = gearProfiles[currentGearKey];
        const totalTime = profile.totalTime;
        const totalWater = Math.round(currentDose * profile.ratio);
        const steps = profile.getSteps(currentDose, totalWater);

        // Progress bar percentage
        const progress = Math.min((timerSeconds / totalTime) * 100, 100);
        timerProgressFill.style.width = `${progress}%`;

        // Check if finished
        if (timerSeconds >= totalTime) {
            timerPhaseBadge.textContent = "BREW COMPLETE ✨";
            timerPhaseBadge.style.background = "var(--brown)";
            timerPhaseBadge.style.color = "var(--paper)";
            cueTitle.textContent = "Your cup is ready!";
            cueDesc.textContent = "Swirl your carafe, inhale the aromatics, and enjoy your freshly brewed specialty cup.";
            cueWeightCallout.textContent = `Yield: ~${Math.round(totalWater * 0.88)}g coffee`;

            if (currentStepIndex !== 999) {
                currentStepIndex = 999;
                playChime(true);
            }
            return;
        }

        // Find active step
        const activeIdx = steps.findIndex((st) => timerSeconds >= st.start && timerSeconds < st.end);

        if (activeIdx !== -1) {
            const step = steps[activeIdx];
            timerPhaseBadge.textContent = step.title.toUpperCase();
            timerPhaseBadge.style.background = "#eae2d5";
            timerPhaseBadge.style.color = "var(--brown)";

            cueTitle.textContent = step.title;
            cueDesc.textContent = step.desc;
            cueWeightCallout.textContent = `Target: ${step.targetWeight}`;

            // Play chime on step transition
            if (activeIdx !== currentStepIndex) {
                currentStepIndex = activeIdx;
                playChime(false);
            }
        }
    }

    function startTimer() {
        if (timerRunning) {
            // Pause
            timerRunning = false;
            clearInterval(timerInterval);
            startTimerBtn.textContent = "Resume Brew ▶";
            startTimerBtn.classList.remove("is-running");
            timerPhaseBadge.textContent = "BREW PAUSED ⏸";
        } else {
            // Start / Resume
            timerRunning = true;
            startTimerBtn.textContent = "Pause ⏸";
            startTimerBtn.classList.add("is-running");

            const profile = gearProfiles[currentGearKey];
            if (timerSeconds >= profile.totalTime) {
                timerSeconds = 0;
                currentStepIndex = -1;
            }

            timerInterval = setInterval(() => {
                timerSeconds += 1;
                updateTimerUI();
            }, 1000);

            updateTimerUI();
        }
    }

    function resetTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 0;
        currentStepIndex = -1;
        startTimerBtn.textContent = "Start Brew ▶";
        startTimerBtn.classList.remove("is-running");
        timerClock.textContent = "00:00";
        timerProgressFill.style.width = "0%";
        timerPhaseBadge.textContent = "READY TO BREW";
        timerPhaseBadge.style.background = "#eae2d5";
        timerPhaseBadge.style.color = "var(--brown)";

        updateCalculations();
    }

    // 6. Event Listeners
    // Gear selection buttons
    gearButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            gearButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentGearKey = btn.dataset.gear;

            const profile = gearProfiles[currentGearKey];
            if (profile) {
                currentDose = profile.defaultDose;
            }

            resetTimer();
        });
    });

    // Dose Slider
    if (doseInput) {
        doseInput.addEventListener("input", (e) => {
            currentDose = parseInt(e.target.value, 10);
            presetButtons.forEach((b) => b.classList.remove("active"));
            resetTimer();
        });
    }

    // Stepper buttons
    if (doseMinusBtn) {
        doseMinusBtn.addEventListener("click", () => {
            if (currentDose > 10) {
                currentDose -= 1;
                presetButtons.forEach((b) => b.classList.remove("active"));
                resetTimer();
            }
        });
    }

    if (dosePlusBtn) {
        dosePlusBtn.addEventListener("click", () => {
            if (currentDose < 60) {
                currentDose += 1;
                presetButtons.forEach((b) => b.classList.remove("active"));
                resetTimer();
            }
        });
    }

    // Quick Dose Presets (1 Cup, 2 Cups, 3 Cups)
    presetButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            presetButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentDose = parseInt(btn.dataset.dose, 10);
            resetTimer();
        });
    });

    // Sound toggle
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            soundToggleBtn.textContent = soundEnabled ? "🔔 Sound ON" : "🔕 Sound OFF";
            soundToggleBtn.title = soundEnabled ? "Sound alerts enabled" : "Sound alerts muted";
        });
    }

    // Timer controls
    if (startTimerBtn) startTimerBtn.addEventListener("click", startTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener("click", resetTimer);

    // Initial setup on load
    updateCalculations();

    // Expose helper to launch timer directly from equipment cards
    window.selectBrewEquipment = function (gearId) {
        const targetBtn = document.querySelector(`#timerGearSelect .gear-btn[data-gear="${gearId}"]`);
        if (targetBtn) {
            targetBtn.click();
            const calcSec = document.getElementById("calculator");
            if (calcSec) {
                calcSec.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };
})();
