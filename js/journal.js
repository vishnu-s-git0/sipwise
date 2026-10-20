/**
 * Sipwise — Personal Tasting Journal & Cup Logger Engine
 * Supports both Live Supabase and Local Sandbox Mode.
 */

(function () {
    const STORAGE_KEY_PREFIX = "sipwise_brew_journal_";
    let supabaseClient = null;

    // Sample pre-seeded journal entries for demo user
    const preSeededDemoJournal = [
        {
            id: "jrn_demo_1",
            userId: "usr_demo_441829",
            beanName: "Attikan Estate Dark",
            roasterName: "Blue Tokai Coffee Roasters",
            gearId: "v60",
            gearName: "Hario V60 Pour-Over",
            doseGrams: 15,
            waterGrams: 225,
            brewTimeSeconds: 175,
            grindSetting: "18 clicks (Medium-Fine)",
            rating: 5,
            extractionResult: "Sweet & Balanced",
            tastingNotes: "Incredible sweet jaggery aroma on the bloom. Balanced notes of roasted almond and dark cocoa with a smooth, lingering finish.",
            flavorTags: ["Dark Chocolate", "Nutty / Almond", "Sweet Jaggery"],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
            id: "jrn_demo_2",
            userId: "usr_demo_441829",
            beanName: "Riverdale Estate N72 (Yeast Ferment)",
            roasterName: "Corridor Seven Coffee Roasters",
            gearId: "aeropress",
            gearName: "AeroPress Brewer",
            doseGrams: 15,
            waterGrams: 200,
            brewTimeSeconds: 120,
            grindSetting: "14 clicks (Medium-Fine)",
            rating: 5,
            extractionResult: "Sweet & Balanced",
            tastingNotes: "Inverted method at 88°C. Ripe passion fruit, mango nectar, and wild florals. Extremely clean cup with vibrant malic acidity.",
            flavorTags: ["Fruit-Forward", "Bright Acidity", "Floral"],
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString() // 4 days ago
        }
    ];

    function getStorageKey() {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        return user ? `${STORAGE_KEY_PREFIX}${user.id}` : `${STORAGE_KEY_PREFIX}guest`;
    }

    function initSupabase() {
        if (window.SIPWISE_CONFIG && window.SIPWISE_CONFIG.isSupabaseConfigured() && window.supabase) {
            supabaseClient = window.supabase.createClient(
                window.SIPWISE_CONFIG.SUPABASE_URL,
                window.SIPWISE_CONFIG.SUPABASE_ANON_KEY
            );
        }
    }

    function getLocalJournal() {
        const key = getStorageKey();
        try {
            const raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn(e);
        }

        // If demo user, seed demo journal
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (user && user.email === "aditi@sipwise.coffee") {
            localStorage.setItem(key, JSON.stringify(preSeededDemoJournal));
            return preSeededDemoJournal;
        }

        return [];
    }

    function saveLocalJournal(entries) {
        localStorage.setItem(getStorageKey(), JSON.stringify(entries));
        notifyJournalChanged();
    }

    function notifyJournalChanged() {
        window.dispatchEvent(new CustomEvent("sipwise:journal-changed"));
        updateJournalBadge();
    }

    /**
     * Get all journal entries
     */
    async function getJournalEntries() {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) return getLocalJournal();

        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from("brew_journal")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                return data.map((d) => ({
                    id: d.id,
                    userId: d.user_id,
                    beanName: d.bean_name,
                    roasterName: d.roaster_name,
                    gearId: d.gear_id,
                    gearName: d.gear_name,
                    doseGrams: parseFloat(d.dose_grams),
                    waterGrams: parseFloat(d.water_grams),
                    brewTimeSeconds: parseInt(d.brew_time_seconds, 10),
                    grindSetting: d.grind_setting,
                    rating: d.rating,
                    extractionResult: d.extraction_result,
                    tastingNotes: d.tasting_notes,
                    flavorTags: d.flavor_tags || [],
                    createdAt: d.created_at
                }));
            }
        }

        return getLocalJournal();
    }

    /**
     * Add a journal entry
     */
    async function addJournalEntry(entry) {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;

        const newEntry = {
            id: "jrn_" + Math.random().toString(36).substring(2, 9),
            userId: user ? user.id : "guest",
            beanName: (entry.beanName || "Single-Estate Brew").trim(),
            roasterName: (entry.roasterName || "").trim(),
            gearId: entry.gearId || "v60",
            gearName: entry.gearName || "Pour-Over (V60)",
            doseGrams: parseFloat(entry.doseGrams) || 15,
            waterGrams: parseFloat(entry.waterGrams) || 225,
            brewTimeSeconds: parseInt(entry.brewTimeSeconds, 10) || 180,
            grindSetting: (entry.grindSetting || "").trim(),
            rating: parseInt(entry.rating, 10) || 5,
            extractionResult: entry.extractionResult || "Sweet & Balanced",
            tastingNotes: (entry.tastingNotes || "").trim(),
            flavorTags: Array.isArray(entry.flavorTags) ? entry.flavorTags : [],
            createdAt: new Date().toISOString()
        };

        if (supabaseClient && user) {
            await supabaseClient.from("brew_journal").insert({
                user_id: user.id,
                bean_name: newEntry.beanName,
                roaster_name: newEntry.roasterName,
                gear_id: newEntry.gearId,
                gear_name: newEntry.gearName,
                dose_grams: newEntry.doseGrams,
                water_grams: newEntry.waterGrams,
                brew_time_seconds: newEntry.brewTimeSeconds,
                grind_setting: newEntry.grindSetting,
                rating: newEntry.rating,
                extraction_result: newEntry.extractionResult,
                tasting_notes: newEntry.tastingNotes,
                flavor_tags: newEntry.flavorTags
            });
        }

        const list = getLocalJournal();
        list.unshift(newEntry);
        saveLocalJournal(list);

        return newEntry;
    }

    /**
     * Delete a journal entry
     */
    async function deleteJournalEntry(entryId) {
        if (supabaseClient) {
            await supabaseClient.from("brew_journal").delete().eq("id", entryId);
        }

        let list = getLocalJournal();
        list = list.filter((e) => e.id !== entryId);
        saveLocalJournal(list);
        return true;
    }

    /**
     * Calculate user brew statistics
     */
    async function getJournalStats() {
        const entries = await getJournalEntries();
        if (entries.length === 0) {
            return {
                totalCups: 0,
                favoriteGear: "None logged yet",
                averageRating: "5.0",
                topFlavor: "None"
            };
        }

        const totalCups = entries.length;
        const avg = (entries.reduce((acc, e) => acc + e.rating, 0) / totalCups).toFixed(1);

        // Count equipment
        const gearCounts = {};
        entries.forEach((e) => {
            gearCounts[e.gearName] = (gearCounts[e.gearName] || 0) + 1;
        });
        let topGear = Object.keys(gearCounts)[0];
        let maxCount = 0;
        for (const [gear, count] of Object.entries(gearCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topGear = gear;
            }
        }

        // Count flavor tags
        const flavorCounts = {};
        entries.forEach((e) => {
            if (e.flavorTags) {
                e.flavorTags.forEach((t) => {
                    flavorCounts[t] = (flavorCounts[t] || 0) + 1;
                });
            }
        });
        let topFlavor = "Rich & Sweet";
        let maxFlavorCount = 0;
        for (const [tag, count] of Object.entries(flavorCounts)) {
            if (count > maxFlavorCount) {
                maxFlavorCount = count;
                topFlavor = tag;
            }
        }

        return {
            totalCups,
            favoriteGear: topGear,
            averageRating: avg,
            topFlavor
        };
    }

    function formatSeconds(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    }

    /**
     * Modal: Log Your Cup
     */
    function ensureLogCupModal() {
        if (document.getElementById("sipwiseLogCupModal")) return;

        const modalHTML = `
        <div id="sipwiseLogCupModal" class="sipwise-modal-overlay" aria-hidden="true">
            <div class="sipwise-modal-dialog log-cup-dialog" role="dialog" aria-modal="true" aria-labelledby="logCupHeading">
                <button type="button" class="modal-close-btn" id="logCupCloseBtn" aria-label="Close modal">✕</button>
                
                <div class="auth-modal-header">
                    <span class="auth-brand-badge">TASTING JOURNAL</span>
                    <h2 id="logCupHeading">Log Your Daily Brew</h2>
                    <p class="auth-modal-sub">Record your sensory notes, dose, and extraction results to track your palate evolution over time.</p>
                </div>

                <form id="logCupForm" class="auth-form-content">
                    <!-- Inventory Coffee Bag Selector -->
                    <div class="auth-field-group">
                        <label for="jrnBagSelect">📦 Active Coffee Bag (Auto-Deducts Weight)</label>
                        <select id="jrnBagSelect">
                            <option value="">-- Custom / Unlisted Bag --</option>
                        </select>
                    </div>

                    <!-- Bean & Roaster -->
                    <div class="log-form-row">
                        <div class="auth-field-group" style="flex: 1.2;">
                            <label for="jrnBeanName">Bean / Estate Harvest</label>
                            <input type="text" id="jrnBeanName" list="journalBeanList" required placeholder="e.g. Attikan Estate, Riverdale N72">
                            <datalist id="journalBeanList">
                                <option value="Attikan Estate Dark (Blue Tokai)">
                                <option value="Riverdale Estate N72 (Corridor Seven)">
                                <option value="Ratnagiri Estate Carbonic (Bloom Coffee)">
                                <option value="Araku Grand Reserve (Araku)">
                                <option value="Monsooned Malabar AA (Blue Tokai)">
                                <option value="Kelagur Pulp Sun-Dried (KC Roasters)">
                                <option value="Baarbara Berry Washed (Third Wave)">
                                <option value="Project Sankalp Lot (Subko)">
                                <option value="Parama Cold-Smoked (Maverick & Farmer)">
                            </datalist>
                        </div>
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="jrnRoasterName">Roaster</label>
                            <input type="text" id="jrnRoasterName" placeholder="e.g. Blue Tokai, Subko">
                        </div>
                    </div>

                    <!-- Equipment & Recipe Specs -->
                    <div class="log-form-row">
                        <div class="auth-field-group" style="flex: 1.2;">
                            <label for="jrnGearSelect">Brewing Equipment</label>
                            <select id="jrnGearSelect">
                                <option value="v60" data-name="Hario V60 Pour-Over">☕ Hario V60 Pour-Over</option>
                                <option value="aeropress" data-name="AeroPress Brewer">💨 AeroPress Brewer</option>
                                <option value="south-indian-filter" data-name="South Indian Filter">🇮🇳 South Indian Filter</option>
                                <option value="french-press" data-name="French Press (Plunger)">🫖 French Press</option>
                                <option value="moka-pot" data-name="Moka Pot (Stovetop)">🔥 Moka Pot</option>
                                <option value="cold-brew" data-name="Cold Brew Dripper">🧊 Cold Brew</option>
                                <option value="espresso" data-name="Espresso Machine">⚡ Espresso Machine</option>
                            </select>
                        </div>
                        <div class="auth-field-group" style="flex: 0.8;">
                            <label for="jrnDose">Dose (grams)</label>
                            <input type="number" id="jrnDose" min="5" max="100" step="0.5" value="15" placeholder="15g" required>
                        </div>
                        <div class="auth-field-group" style="flex: 0.8;">
                            <label for="jrnWater">Water (grams)</label>
                            <input type="number" id="jrnWater" min="20" max="1200" step="1" value="225" placeholder="225g" required>
                        </div>
                    </div>

                    <!-- Dose Quick Stepper for Mobile Kitchen Logging -->
                    <div class="dose-quick-steppers">
                        <span class="stepper-label">Quick Dose:</span>
                        <button type="button" class="dose-chip" data-dose="12" data-water="180">12g (1:15)</button>
                        <button type="button" class="dose-chip active" data-dose="15" data-water="225">15g (1:15)</button>
                        <button type="button" class="dose-chip" data-dose="18" data-water="270">18g (1:15)</button>
                        <button type="button" class="dose-chip" data-dose="20" data-water="320">20g (1:16)</button>
                        <button type="button" class="dose-chip" data-dose="30" data-water="450">30g (1:15)</button>
                    </div>

                    <!-- Time & Grind Dial-In -->
                    <div class="log-form-row">
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="jrnBrewTime">Brew Time (MM:SS)</label>
                            <input type="text" id="jrnBrewTime" placeholder="03:00" value="03:00">
                        </div>
                        <div class="auth-field-group" style="flex: 1.5;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label for="jrnGrind">Grind Dial-In / Clicks</label>
                                <a href="javascript:void(0)" onclick="if(window.SipwiseEquipment) window.SipwiseEquipment.openEquipmentModal()" style="font-size:0.75rem; color:var(--color-accent); text-decoration:none;">⚙️ Equipment Locker</a>
                            </div>
                            <input type="text" id="jrnGrind" placeholder="e.g. 14 clicks (Timemore C2)">
                        </div>
                    </div>

                    <!-- Overall Rating -->
                    <div class="auth-field-group">
                        <label>Your Cup Rating</label>
                        <div class="star-rating-picker" id="jrnStarPicker">
                            <span class="star-pick" data-val="1">★</span>
                            <span class="star-pick" data-val="2">★</span>
                            <span class="star-pick" data-val="3">★</span>
                            <span class="star-pick" data-val="4">★</span>
                            <span class="star-pick active" data-val="5">★</span>
                        </div>
                        <input type="hidden" id="jrnRatingInput" value="5">
                    </div>

                    <!-- Extraction Result Diagnostic -->
                    <div class="auth-field-group">
                        <label>Extraction Result</label>
                        <div class="extraction-diag-picker" id="jrnExtractionPicker">
                            <button type="button" class="diag-opt active" data-res="Sweet & Balanced">✨ Sweet & Balanced</button>
                            <button type="button" class="diag-opt" data-res="Slightly Sour (Under)">🍋 Slightly Sour</button>
                            <button type="button" class="diag-opt" data-res="Slightly Bitter (Over)">🍫 Slightly Bitter</button>
                            <button type="button" class="diag-opt" data-res="Channeling / Astringent">🍂 Astringent / Dry</button>
                        </div>
                        <input type="hidden" id="jrnExtractionInput" value="Sweet & Balanced">
                    </div>

                    <!-- Flavor Tags -->
                    <div class="auth-field-group">
                        <label>Flavor Notes Detected</label>
                        <div class="flavor-tag-picker" id="jrnFlavorPicker">
                            <button type="button" class="tag-opt" data-tag="Fruit-Forward">Fruit-Forward</button>
                            <button type="button" class="tag-opt" data-tag="Dark Chocolate">Dark Chocolate</button>
                            <button type="button" class="tag-opt" data-tag="Sweet Jaggery">Sweet Jaggery</button>
                            <button type="button" class="tag-opt" data-tag="Bright Acidity">Bright Acidity</button>
                            <button type="button" class="tag-opt" data-tag="Nutty / Almond">Nutty / Almond</button>
                            <button type="button" class="tag-opt" data-tag="Floral / Jasmine">Floral / Jasmine</button>
                            <button type="button" class="tag-opt" data-tag="Velvety Body">Velvety Body</button>
                        </div>
                    </div>

                    <!-- Tasting Notes -->
                    <div class="auth-field-group">
                        <label for="jrnNotes">Personal Tasting Impressions</label>
                        <textarea id="jrnNotes" rows="2" placeholder="Describe the aroma, mouthfeel, sweetness, or notes on how this cup turned out..."></textarea>
                    </div>

                    <button type="submit" class="auth-submit-btn" id="saveCupBtn">Save Cup to Journal 📓</button>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
        bindLogCupModalEvents();
    }

    function bindLogCupModalEvents() {
        const modal = document.getElementById("sipwiseLogCupModal");
        const closeBtn = document.getElementById("logCupCloseBtn");
        const form = document.getElementById("logCupForm");
        const starPickers = modal.querySelectorAll("#jrnStarPicker .star-pick");
        const ratingInput = document.getElementById("jrnRatingInput");
        const diagOpts = modal.querySelectorAll("#jrnExtractionPicker .diag-opt");
        const diagInput = document.getElementById("jrnExtractionInput");
        const tagOpts = modal.querySelectorAll("#jrnFlavorPicker .tag-opt");

        closeBtn.addEventListener("click", closeLogCupModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeLogCupModal();
        });

        // Stars
        starPickers.forEach((star) => {
            star.addEventListener("click", () => {
                const val = parseInt(star.dataset.val, 10);
                ratingInput.value = val;
                starPickers.forEach((s) => {
                    const sVal = parseInt(s.dataset.val, 10);
                    s.classList.toggle("active", sVal <= val);
                });
            });
        });

        // Extraction diagnosis
        diagOpts.forEach((btn) => {
            btn.addEventListener("click", () => {
                diagOpts.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                diagInput.value = btn.dataset.res;
            });
        });

        // Dose stepper chips
        const doseChips = modal.querySelectorAll(".dose-quick-steppers .dose-chip");
        const doseInput = document.getElementById("jrnDose");
        const waterInput = document.getElementById("jrnWater");

        doseChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                doseChips.forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                if (doseInput) doseInput.value = chip.dataset.dose;
                if (waterInput) waterInput.value = chip.dataset.water;
            });
        });

        // Equipment switch click helper
        const gearSelectEl = document.getElementById("jrnGearSelect");
        const grindInputEl = document.getElementById("jrnGrind");
        if (gearSelectEl && grindInputEl) {
            gearSelectEl.addEventListener("change", async () => {
                const val = gearSelectEl.value;
                try {
                    localStorage.setItem("sipwise_last_gear", val);
                    if (window.SipwiseEquipment) {
                        const items = await window.SipwiseEquipment.getEquipment();
                        const match = items.find(i => i.equipmentType === "brewer" && i.name.toLowerCase().includes(val.split("-")[0]));
                        if (match && match.defaultClicks && !grindInputEl.value) {
                            grindInputEl.value = match.defaultClicks;
                        }
                    }
                } catch (e) {}
            });
        }

        // Flavor tags
        tagOpts.forEach((btn) => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("active");
            });
        });

        // Form submit
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
            if (!user) {
                closeLogCupModal();
                if (window.SipwiseAuth) {
                    window.SipwiseAuth.openAuthModal("signin", () => {
                        openLogCupModal();
                    });
                }
                return;
            }

            const beanName = document.getElementById("jrnBeanName").value;
            const roasterName = document.getElementById("jrnRoasterName").value;
            const gearSelect = document.getElementById("jrnGearSelect");
            const gearId = gearSelect.value;
            const gearName = gearSelect.options[gearSelect.selectedIndex].dataset.name || gearSelect.value;
            const doseGrams = document.getElementById("jrnDose").value;
            const waterGrams = document.getElementById("jrnWater").value;
            const brewTimeStr = document.getElementById("jrnBrewTime").value;

            // Parse MM:SS
            let brewTimeSeconds = 180;
            if (brewTimeStr.includes(":")) {
                const parts = brewTimeStr.split(":");
                brewTimeSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            } else {
                brewTimeSeconds = parseInt(brewTimeStr, 10) || 180;
            }

            const grindSetting = document.getElementById("jrnGrind").value;
            const rating = ratingInput.value;
            const extractionResult = diagInput.value;
            const tastingNotes = document.getElementById("jrnNotes").value;
            const selectedTags = Array.from(modal.querySelectorAll("#jrnFlavorPicker .tag-opt.active")).map(
                (b) => b.dataset.tag
            );

            const bagSelect = document.getElementById("jrnBagSelect");
            const selectedBagId = bagSelect ? bagSelect.value : null;

            const saveBtn = document.getElementById("saveCupBtn");
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving to Journal...";

            try {
                // Remember gear and grind for rapid subsequent brews
                localStorage.setItem("sipwise_last_gear", gearId);
                if (grindSetting) localStorage.setItem("sipwise_last_grind", grindSetting);

                // Auto-deduct coffee dose from bag if bag is selected
                if (selectedBagId && window.SipwiseInventory && window.SipwiseInventory.deductFromBag) {
                    await window.SipwiseInventory.deductFromBag(selectedBagId, doseGrams);
                }

                await addJournalEntry({
                    beanName,
                    roasterName,
                    gearId,
                    gearName,
                    doseGrams,
                    waterGrams,
                    brewTimeSeconds,
                    grindSetting,
                    rating,
                    extractionResult,
                    tastingNotes,
                    flavorTags: selectedTags
                });

                closeLogCupModal();

                // Open shelf directly on journal tab
                if (window.SipwiseBookmarks && window.SipwiseBookmarks.openShelfDrawer) {
                    window.SipwiseBookmarks.openShelfDrawer("journal");
                }
            } catch (err) {
                alert(err.message || "Failed to save journal entry.");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Cup to Journal 📓";
            }
        });
    }

    async function openLogCupModal(prefill = {}) {
        // Enforce user authentication to log brews
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) {
            if (window.SipwiseAuth) {
                window.SipwiseAuth.openAuthModal("signin", () => {
                    openLogCupModal(prefill);
                });
            }
            return;
        }

        ensureLogCupModal();
        const modal = document.getElementById("sipwiseLogCupModal");

        // Populate active bags dropdown
        const bagSelect = document.getElementById("jrnBagSelect");
        if (bagSelect && window.SipwiseInventory) {
            const activeBags = await window.SipwiseInventory.getBags("active");
            bagSelect.innerHTML = `<option value="">-- Custom / Unlisted Bag --</option>` +
                activeBags.map(b => `<option value="${b.id}" data-name="${b.coffeeName}" data-roaster="${b.roaster}">${b.coffeeName} (${b.remainingWeightGrams}g left)</option>`).join("");

            bagSelect.onchange = () => {
                const opt = bagSelect.options[bagSelect.selectedIndex];
                if (opt && opt.value) {
                    const beanEl = document.getElementById("jrnBeanName");
                    const roasterEl = document.getElementById("jrnRoasterName");
                    if (beanEl) beanEl.value = opt.dataset.name || "";
                    if (roasterEl) roasterEl.value = opt.dataset.roaster || "";
                }
            };

            // Auto-select first active bag if available and not custom prefilled
            if (activeBags.length > 0 && !prefill.bean) {
                bagSelect.value = activeBags[0].id;
                const beanEl = document.getElementById("jrnBeanName");
                const roasterEl = document.getElementById("jrnRoasterName");
                if (beanEl) beanEl.value = activeBags[0].coffeeName;
                if (roasterEl) roasterEl.value = activeBags[0].roaster;
            }
        }

        if (prefill.gearId) {
            const gearSelect = document.getElementById("jrnGearSelect");
            if (gearSelect) gearSelect.value = prefill.gearId;
        } else {
            try {
                const lastGear = localStorage.getItem("sipwise_last_gear");
                if (lastGear) {
                    const gearSelect = document.getElementById("jrnGearSelect");
                    if (gearSelect) gearSelect.value = lastGear;
                }
                const lastGrind = localStorage.getItem("sipwise_last_grind");
                if (lastGrind) {
                    const grindEl = document.getElementById("jrnGrind");
                    if (grindEl && !grindEl.value) grindEl.value = lastGrind;
                }
            } catch (e) {}
        }
        if (prefill.dose) {
            const doseEl = document.getElementById("jrnDose");
            if (doseEl) doseEl.value = prefill.dose;
        }
        if (prefill.water) {
            const waterEl = document.getElementById("jrnWater");
            if (waterEl) waterEl.value = prefill.water;
        }
        if (prefill.seconds) {
            const timeEl = document.getElementById("jrnBrewTime");
            if (timeEl) timeEl.value = formatSeconds(prefill.seconds);
        }
        if (prefill.bean) {
            const beanEl = document.getElementById("jrnBeanName");
            if (beanEl) beanEl.value = prefill.bean;
        }

        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLogCupModal() {
        const modal = document.getElementById("sipwiseLogCupModal");
        if (modal) {
            modal.classList.remove("is-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Export brew history to CSV file
     */
    async function exportToCSV() {
        const entries = await getJournalEntries();
        if (!entries || entries.length === 0) {
            alert("No brew journal entries found to export. Log your first cup first!");
            return;
        }

        const headers = [
            "Date",
            "Coffee Name",
            "Roaster",
            "Brewing Equipment",
            "Coffee Dose (g)",
            "Water Amount (g)",
            "Ratio",
            "Brew Time (MM:SS)",
            "Grind / Dial-in Setting",
            "Extraction Diagnosis",
            "Rating (out of 5)",
            "Flavor Notes",
            "Personal Tasting Notes"
        ];

        function esc(val) {
            if (val === null || val === undefined) return '""';
            return `"${String(val).replace(/"/g, '""')}"`;
        }

        const rows = entries.map((e) => {
            const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
            const ratio = e.doseGrams ? `1:${Math.round(e.waterGrams / e.doseGrams)}` : "";
            const timeStr = formatSeconds(e.brewTimeSeconds);
            const flavors = Array.isArray(e.flavorTags) ? e.flavorTags.join("; ") : "";

            return [
                esc(dateStr),
                esc(e.beanName),
                esc(e.roasterName || ""),
                esc(e.gearName || e.gearId),
                esc(e.doseGrams),
                esc(e.waterGrams),
                esc(ratio),
                esc(timeStr),
                esc(e.grindSetting || ""),
                esc(e.extractionResult || ""),
                esc(e.rating),
                esc(flavors),
                esc(e.tastingNotes || "")
            ].join(",");
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateNow = new Date().toISOString().split("T")[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `sipwise-brew-journal-${dateNow}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.SipwiseBookmarks && window.SipwiseBookmarks.showToast) {
            window.SipwiseBookmarks.showToast("Brew history downloaded as CSV 📥");
        }
    }

    /**
     * Export or print brew history as styled PDF cupping sheet
     */
    async function exportToPDF() {
        const entries = await getJournalEntries();
        if (!entries || entries.length === 0) {
            alert("No brew journal entries found to export. Log your first cup first!");
            return;
        }

        const stats = await getJournalStats();
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        const userName = user ? user.fullName : "Coffee Enthusiast";
        const dateStr = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const rowsHTML = entries
            .map((e) => {
                const d = new Date(e.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
                const stars = "★".repeat(e.rating) + "☆".repeat(5 - e.rating);
                const ratio = e.doseGrams ? `1:${Math.round(e.waterGrams / e.doseGrams)}` : "";
                const timeStr = formatSeconds(e.brewTimeSeconds);
                const tags = (e.flavorTags || [])
                    .map((t) => `<span class="tag-chip">${escapeHTML(t)}</span>`)
                    .join(" ");

                return `
            <tr>
                <td style="white-space: nowrap; font-weight: 500;">${d}</td>
                <td>
                    <strong>${escapeHTML(e.beanName)}</strong>
                    ${e.roasterName ? `<div style="font-size: 11px; color: #777;">by ${escapeHTML(e.roasterName)}</div>` : ""}
                </td>
                <td>${escapeHTML(e.gearName || e.gearId)}</td>
                <td style="white-space: nowrap;">
                    ${e.doseGrams}g / ${e.waterGrams}g
                    <div style="font-size: 11px; color: #777;">Ratio ${ratio} • ${timeStr}</div>
                </td>
                <td>${escapeHTML(e.grindSetting || "—")}</td>
                <td>
                    <span style="color: #b56c25; font-size: 14px;">${stars}</span>
                    <div style="font-size: 11px; color: #555;">${escapeHTML(e.extractionResult || "")}</div>
                </td>
                <td>
                    ${tags ? `<div style="margin-bottom: 4px;">${tags}</div>` : ""}
                    ${e.tastingNotes ? `<div style="font-style: italic; font-size: 11.5px; color: #444;">"${escapeHTML(e.tastingNotes)}"</div>` : "—"}
                </td>
            </tr>
            `;
            })
            .join("");

        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sipwise Brew Journal — ${userName}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 10mm;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #22140c;
            background: #fff;
            margin: 0;
            padding: 24px;
            font-size: 12px;
            line-height: 1.4;
        }
        .no-print-bar {
            background: #24130c;
            color: #f7eedb;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
            margin-bottom: 24px;
        }
        .btn-print {
            background: #c98a4b;
            color: #fff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn-close {
            background: transparent;
            color: #d8c8b8;
            border: 1px solid #665;
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 8px;
        }
        .sheet-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #24130c;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .brand-logo {
            font-family: Georgia, serif;
            font-size: 26px;
            font-weight: bold;
            color: #24130c;
            letter-spacing: -0.5px;
        }
        .brand-logo span { color: #c98a4b; }
        .sheet-title {
            font-size: 14px;
            color: #665;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }
        .sheet-meta {
            text-align: right;
            font-size: 11.5px;
            color: #555;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .stat-box {
            background: #faf6f0;
            border: 1px solid #e8decb;
            border-radius: 6px;
            padding: 10px 14px;
        }
        .stat-label {
            font-size: 10px;
            color: #776a5c;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .stat-num {
            font-size: 18px;
            font-family: Georgia, serif;
            font-weight: bold;
            color: #24130c;
            margin-top: 2px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
        }
        th {
            background: #f4ede2;
            color: #3b2314;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 2px solid #c98a4b;
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }
        tr:nth-child(even) td {
            background: #faf8f5;
        }
        .tag-chip {
            background: #ede3d3;
            color: #4a3424;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 9.5px;
            display: inline-block;
            margin-right: 2px;
            margin-bottom: 2px;
        }
        .sheet-footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #888;
        }
        @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0 !important; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="no-print-bar">
        <div>
            <strong>📄 Print / Save as PDF Preview</strong>
            <span style="font-size: 11px; margin-left: 8px; opacity: 0.8;">Choose "Save as PDF" in your print destination</span>
        </div>
        <div>
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="btn-close" onclick="window.close()">✕ Close</button>
        </div>
    </div>

    <div class="sheet-header">
        <div>
            <div class="brand-logo">sipwise<span>.</span></div>
            <div class="sheet-title">Personal Coffee Tasting Journal &amp; Brew History</div>
        </div>
        <div class="sheet-meta">
            <div><strong>Barista:</strong> ${escapeHTML(userName)}</div>
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Entries:</strong> ${entries.length} ${entries.length === 1 ? "cup" : "cups"}</div>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-box">
            <div class="stat-label">Total Cups</div>
            <div class="stat-num">${stats.totalCups}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Avg Rating</div>
            <div class="stat-num">★ ${stats.averageRating}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Favorite Brewer</div>
            <div class="stat-num" style="font-size: 13px;">${escapeHTML(stats.favoriteGear)}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Top Flavor</div>
            <div class="stat-num" style="font-size: 13px;">${escapeHTML(stats.topFlavor)}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 10%;">Date</th>
                <th style="width: 22%;">Coffee &amp; Roaster</th>
                <th style="width: 14%;">Equipment</th>
                <th style="width: 15%;">Recipe &amp; Time</th>
                <th style="width: 11%;">Grind Setting</th>
                <th style="width: 12%;">Rating</th>
                <th style="width: 16%;">Flavors &amp; Impressions</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHTML}
        </tbody>
    </table>

    <div class="sheet-footer">
        <span>Sipwise — Specialty Coffee Journal &amp; Discovery</span>
        <span>Generated from local brew logs • https://sipwise.coffee</span>
    </div>
</body>
</html>`;

        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printHTML);
            printWindow.document.close();
        } else {
            alert("Popup blocked. Please allow popups for this site to export or print your journal.");
        }
    }

    /**
     * Render the Journal View inside container
     */
    async function renderJournalView(container) {
        if (!container) return;

        const entries = await getJournalEntries();
        const stats = await getJournalStats();

        container.innerHTML = `
            <div class="journal-view-wrapper">
                <!-- Personal Stats Strip -->
                <div class="journal-stats-card">
                    <div class="jrn-stat-item">
                        <span class="jrn-stat-label">TOTAL CUPS</span>
                        <span class="jrn-stat-val">${stats.totalCups}</span>
                    </div>
                    <div class="jrn-stat-item">
                        <span class="jrn-stat-label">FAVORITE GEAR</span>
                        <span class="jrn-stat-val" style="font-size: 13px;">${stats.favoriteGear}</span>
                    </div>
                    <div class="jrn-stat-item">
                        <span class="jrn-stat-label">AVG RATING</span>
                        <span class="jrn-stat-val">★ ${stats.averageRating}</span>
                    </div>
                </div>

                <div class="journal-action-bar">
                    <span class="journal-headline-label">Recent Brew Entries</span>
                    <div class="journal-actions-group">
                        <button type="button" class="jrn-export-btn" id="exportCsvBtn" title="Download Brew History as CSV">📥 CSV</button>
                        <button type="button" class="jrn-export-btn" id="exportPdfBtn" title="Export or Print as PDF">📄 PDF</button>
                        <button type="button" class="log-manual-cup-btn" id="openManualLogBtn">
                            + Log a Cup
                        </button>
                    </div>
                </div>

                <!-- Entries Stream -->
                <div class="journal-entries-list">
                    ${
                        entries.length === 0
                            ? `
                        <div class="shelf-empty-state">
                            <span class="empty-icon">📓</span>
                            <h3>No cups logged yet</h3>
                            <p>Use the Live Pour Timer on the Brew Guide or click "+ Log a Cup" to start recording your daily coffee tasting notes.</p>
                        </div>
                    `
                            : entries
                                  .map((entry) => {
                                      const dateStr = new Date(entry.createdAt).toLocaleDateString("en-IN", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric"
                                      });
                                      const stars = "★".repeat(entry.rating) + "☆".repeat(5 - entry.rating);
                                      const timeFormatted = formatSeconds(entry.brewTimeSeconds);
                                      const ratio = Math.round(entry.waterGrams / entry.doseGrams);

                                      return `
                            <article class="journal-entry-card" data-id="${entry.id}">
                                <div class="jrn-card-top">
                                    <div>
                                        <span class="jrn-date-tag">🗓 ${dateStr}</span>
                                        <h4 class="jrn-bean-title">${entry.beanName}</h4>
                                        ${entry.roasterName ? `<span class="jrn-roaster-name">by ${entry.roasterName}</span>` : ""}
                                    </div>
                                    <div class="jrn-top-right">
                                        <span class="stars-gold">${stars}</span>
                                        <button type="button" class="jrn-delete-btn" data-id="${entry.id}" title="Delete entry">🗑</button>
                                    </div>
                                </div>

                                <div class="jrn-specs-pills">
                                    <span class="jrn-pill">☕ ${entry.gearName}</span>
                                    <span class="jrn-pill">⚖️ ${entry.doseGrams}g / ${entry.waterGrams}g (1:${ratio})</span>
                                    <span class="jrn-pill">⏱ ${timeFormatted}</span>
                                    ${entry.grindSetting ? `<span class="jrn-pill">⚙️ ${entry.grindSetting}</span>` : ""}
                                    <span class="jrn-pill jrn-diag-pill">${entry.extractionResult}</span>
                                </div>

                                ${entry.tastingNotes ? `<p class="jrn-notes-text">"${entry.tastingNotes}"</p>` : ""}

                                ${
                                    entry.flavorTags && entry.flavorTags.length > 0
                                        ? `
                                    <div class="review-tags-row" style="margin-top: 8px;">
                                        ${entry.flavorTags.map((t) => `<span class="review-chip">${t}</span>`).join("")}
                                    </div>
                                `
                                        : ""
                                }

                                <div class="jrn-card-footer">
                                    <button type="button" class="jrn-brew-again-btn" onclick="selectBrewEquipment('${entry.gearId}')">
                                        Brew again with timer ⏱
                                    </button>
                                </div>
                            </article>
                        `;
                                  })
                                  .join("")
                    }
                </div>
            </div>
        `;

        // Bind manual log button
        const manualBtn = container.querySelector("#openManualLogBtn");
        if (manualBtn) {
            manualBtn.addEventListener("click", () => {
                openLogCupModal();
            });
        }

        // Bind export buttons
        const csvBtn = container.querySelector("#exportCsvBtn");
        if (csvBtn) {
            csvBtn.addEventListener("click", () => {
                exportToCSV();
            });
        }

        const pdfBtn = container.querySelector("#exportPdfBtn");
        if (pdfBtn) {
            pdfBtn.addEventListener("click", () => {
                exportToPDF();
            });
        }

        // Bind delete buttons
        container.querySelectorAll(".jrn-delete-btn").forEach((delBtn) => {
            delBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const id = delBtn.dataset.id;
                if (!confirm("Are you sure you want to delete this brew journal entry?")) return;
                delBtn.disabled = true;
                await deleteJournalEntry(id);
                await renderJournalView(container);
            });
        });
    }

    function updateJournalBadge() {
        const list = getLocalJournal();
        const badge = document.getElementById("countJournal");
        if (badge) {
            badge.textContent = list.length;
        }
        const dropBadge = document.getElementById("dropdownJournalBadge");
        if (dropBadge) {
            dropBadge.textContent = list.length;
        }
    }

    // Public API
    window.SipwiseJournal = {
        getJournalEntries,
        addJournalEntry,
        deleteJournalEntry,
        getJournalStats,
        openLogCupModal,
        closeLogCupModal,
        renderJournalView,
        exportToCSV,
        exportToPDF,
        updateBadge: updateJournalBadge
    };

    document.addEventListener("DOMContentLoaded", () => {
        initSupabase();
        updateJournalBadge();

        if (window.location.hash === "#quicklog") {
            setTimeout(() => {
                openLogCupModal();
            }, 300);
        }
    });

    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#quicklog") {
            openLogCupModal();
        }
    });

    window.addEventListener("sipwise:auth-changed", () => {
        updateJournalBadge();
    });
})();
