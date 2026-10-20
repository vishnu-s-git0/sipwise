/**
 * Sipwise — Coffee Bag Inventory & Auto-Deduct Engine
 * Part of Phase 1: Personal Journal & Coffee Inventory
 */

(function () {
    const STORAGE_KEY_PREFIX = "sipwise_coffee_bags_";
    let supabaseClient = null;

    // Helper: calculate days off roast
    function getDaysOffRoast(roastDateStr) {
        if (!roastDateStr) return 0;
        const roastTime = new Date(roastDateStr).getTime();
        const now = Date.now();
        const diffDays = Math.floor((now - roastTime) / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Helper: get roast date freshness label
    function getFreshnessStatus(days) {
        if (days <= 4) return { label: "Degassing (Rest 2-3 days)", tone: "neutral" };
        if (days <= 21) return { label: `Peak Flavor (${days}d off roast)`, tone: "peak" };
        if (days <= 45) return { label: `Good (${days}d off roast)`, tone: "good" };
        return { label: `Aged (${days}d off roast)`, tone: "aged" };
    }

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

    function getLocalBags() {
        const key = getStorageKey();
        try {
            const raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn(e);
        }

        // Demo seed bags
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (user && user.email === "aditi@sipwise.coffee") {
            const seedBags = [
                {
                    id: "bag_demo_101",
                    userId: "usr_demo_441829",
                    coffeeId: "attikan-estate",
                    coffeeName: "Attikan Estate Dark",
                    roaster: "Blue Tokai Coffee Roasters",
                    roastDate: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0], // 7 days ago
                    purchaseDate: new Date(Date.now() - 86400000 * 6).toISOString().split("T")[0],
                    initialWeightGrams: 250,
                    remainingWeightGrams: 185,
                    priceInr: 550,
                    status: "active",
                    notes: "Daily morning espresso & South Indian filter staple.",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "bag_demo_102",
                    userId: "usr_demo_441829",
                    coffeeId: "riverdale-yeast",
                    coffeeName: "Riverdale Estate N72 (Yeast Ferment)",
                    roaster: "Corridor Seven Coffee Roasters",
                    roastDate: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0], // 10 days ago
                    purchaseDate: new Date(Date.now() - 86400000 * 9).toISOString().split("T")[0],
                    initialWeightGrams: 250,
                    remainingWeightGrams: 140,
                    priceInr: 620,
                    status: "active",
                    notes: "Weekend pour-overs. Ripe mango & passion fruit notes.",
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(key, JSON.stringify(seedBags));
            return seedBags;
        }

        return [];
    }

    function saveLocalBags(bags) {
        localStorage.setItem(getStorageKey(), JSON.stringify(bags));
        notifyInventoryChanged();
    }

    function notifyInventoryChanged() {
        window.dispatchEvent(new CustomEvent("sipwise:inventory-changed"));
        updateInventoryBadges();
    }

    /**
     * Get all bags
     */
    async function getBags(status = "all") {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        let bags = [];

        if (supabaseClient && user) {
            let query = supabaseClient.from("coffee_bags").select("*").order("created_at", { ascending: false });
            if (status !== "all") {
                query = query.eq("status", status);
            }
            const { data, error } = await query;
            if (!error && data) {
                bags = data.map((b) => ({
                    id: b.id,
                    userId: b.user_id,
                    coffeeId: b.coffee_id,
                    coffeeName: b.coffee_name,
                    roaster: b.roaster,
                    roastDate: b.roast_date,
                    purchaseDate: b.purchase_date,
                    initialWeightGrams: parseFloat(b.initial_weight_grams),
                    remainingWeightGrams: parseFloat(b.remaining_weight_grams),
                    priceInr: b.price_inr ? parseFloat(b.price_inr) : null,
                    status: b.status,
                    notes: b.notes,
                    createdAt: b.created_at
                }));
            } else {
                bags = getLocalBags();
            }
        } else {
            bags = getLocalBags();
        }

        if (status === "all") return bags;
        return bags.filter((b) => b.status === status);
    }

    async function getBagById(id) {
        const bags = await getBags("all");
        return bags.find((b) => b.id === id) || null;
    }

    /**
     * Add a new coffee bag to inventory
     */
    async function addBag({ coffeeId, coffeeName, roaster, roastDate, initialWeight, price, notes }) {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        const weight = parseFloat(initialWeight) || 250;

        const newBag = {
            id: "bag_" + Math.random().toString(36).substring(2, 9),
            userId: user ? user.id : "guest",
            coffeeId: coffeeId || null,
            coffeeName: (coffeeName || "Specialty Single-Estate").trim(),
            roaster: (roaster || "Artisanal Roaster").trim(),
            roastDate: roastDate || new Date().toISOString().split("T")[0],
            purchaseDate: new Date().toISOString().split("T")[0],
            initialWeightGrams: weight,
            remainingWeightGrams: weight,
            priceInr: price ? parseFloat(price) : null,
            status: "active",
            notes: (notes || "").trim(),
            createdAt: new Date().toISOString()
        };

        if (supabaseClient && user) {
            await supabaseClient.from("coffee_bags").insert({
                user_id: user.id,
                coffee_id: newBag.coffeeId,
                coffee_name: newBag.coffeeName,
                roaster: newBag.roaster,
                roast_date: newBag.roastDate,
                purchase_date: newBag.purchaseDate,
                initial_weight_grams: newBag.initialWeightGrams,
                remaining_weight_grams: newBag.remainingWeightGrams,
                price_inr: newBag.priceInr,
                status: newBag.status,
                notes: newBag.notes
            });
        }

        const bags = getLocalBags();
        bags.unshift(newBag);
        saveLocalBags(bags);

        return newBag;
    }

    /**
     * Automatically deduct coffee grams when a brew is logged
     */
    async function deductFromBag(bagId, doseGrams) {
        const bags = getLocalBags();
        const bag = bags.find((b) => b.id === bagId);
        if (!bag) return null;

        const dose = parseFloat(doseGrams) || 15;
        const previous = bag.remainingWeightGrams;
        bag.remainingWeightGrams = Math.max(0, Math.round((previous - dose) * 10) / 10);

        let wasFinished = false;
        if (bag.remainingWeightGrams <= 0) {
            bag.status = "finished";
            wasFinished = true;
        }

        if (supabaseClient) {
            await supabaseClient
                .from("coffee_bags")
                .update({
                    remaining_weight_grams: bag.remainingWeightGrams,
                    status: bag.status
                })
                .eq("id", bagId);
        }

        saveLocalBags(bags);

        return {
            bag,
            deducted: dose,
            remaining: bag.remainingWeightGrams,
            wasFinished
        };
    }

    async function deleteBag(bagId) {
        if (supabaseClient) {
            await supabaseClient.from("coffee_bags").delete().eq("id", bagId);
        }
        let bags = getLocalBags();
        bags = bags.filter((b) => b.id !== bagId);
        saveLocalBags(bags);
        return true;
    }

    /**
     * Inventory Statistics
     */
    async function getInventoryStats() {
        const bags = await getBags("all");
        const activeBags = bags.filter((b) => b.status === "active");
        const totalGrams = activeBags.reduce((sum, b) => sum + b.remainingWeightGrams, 0);
        const approxCups = Math.floor(totalGrams / 15);

        // Find freshest bag
        let freshestDays = 999;
        activeBags.forEach((b) => {
            const d = getDaysOffRoast(b.roastDate);
            if (d < freshestDays) freshestDays = d;
        });

        return {
            activeBagsCount: activeBags.length,
            totalGrams: Math.round(totalGrams),
            approxCups,
            freshestDays: freshestDays === 999 ? 0 : freshestDays
        };
    }

    /**
     * Add Bag Modal Injection
     */
    function ensureAddBagModal() {
        if (document.getElementById("sipwiseAddBagModal")) return;

        const modalHTML = `
        <div id="sipwiseAddBagModal" class="sipwise-modal-overlay" aria-hidden="true">
            <div class="sipwise-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="addBagHeading">
                <button type="button" class="modal-close-btn" id="addBagCloseBtn" aria-label="Close modal">✕</button>
                
                <div class="auth-modal-header">
                    <span class="auth-brand-badge">MY BEANS INVENTORY</span>
                    <h2 id="addBagHeading">Add Coffee Bag to Stash</h2>
                    <p class="auth-modal-sub">Track roast freshness, remaining grams, and consumption automatically as you brew.</p>
                </div>

                <form id="addBagForm" class="auth-form-content">
                    <div class="auth-field-group">
                        <label for="newBagCoffeeName">Coffee / Estate Name</label>
                        <input type="text" id="newBagCoffeeName" list="inventoryCoffeeSuggestions" required placeholder="e.g. Attikan Estate Dark, Riverdale N72">
                        <datalist id="inventoryCoffeeSuggestions">
                            <option value="Attikan Estate Dark">
                            <option value="Riverdale Estate N72 (Yeast Ferment)">
                            <option value="Ratnagiri Estate Carbonic">
                            <option value="Araku Grand Reserve">
                            <option value="Monsooned Malabar AA">
                            <option value="Kelagur Pulp Sun-Dried">
                            <option value="Baarbara Berry Washed">
                            <option value="Project Sankalp Lot">
                            <option value="Parama Cold-Smoked">
                        </datalist>
                    </div>

                    <div class="auth-field-group">
                        <label for="newBagRoaster">Roaster</label>
                        <input type="text" id="newBagRoaster" required placeholder="e.g. Blue Tokai, Subko, Araku">
                    </div>

                    <div class="log-form-row">
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="newBagRoastDate">Roast Date</label>
                            <input type="date" id="newBagRoastDate" required>
                        </div>
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="newBagWeight">Bag Weight (Grams)</label>
                            <select id="newBagWeight">
                                <option value="250" selected>250g (Standard Bag)</option>
                                <option value="500">500g (Large Bag)</option>
                                <option value="100">100g (Sample Box)</option>
                                <option value="1000">1,000g (1 Kg Bulk)</option>
                            </select>
                        </div>
                    </div>

                    <div class="log-form-row">
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="newBagPrice">Price Paid (₹ INR)</label>
                            <input type="number" id="newBagPrice" placeholder="550" min="0">
                        </div>
                        <div class="auth-field-group" style="flex: 1;">
                            <label for="newBagStatus">Status</label>
                            <select id="newBagStatus">
                                <option value="active" selected>Active (Brewing)</option>
                                <option value="frozen">Frozen (Deep Storage)</option>
                            </select>
                        </div>
                    </div>

                    <div class="auth-field-group">
                        <label for="newBagNotes">Notes / Flavor Expectations</label>
                        <input type="text" id="newBagNotes" placeholder="e.g. Recommended rest: 10 days. V60 staple.">
                    </div>

                    <button type="submit" class="auth-submit-btn" id="saveBagSubmitBtn">Add Bag to My Beans ☕</button>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modal = document.getElementById("sipwiseAddBagModal");
        const closeBtn = document.getElementById("addBagCloseBtn");
        const form = document.getElementById("addBagForm");
        const roastDateInput = document.getElementById("newBagRoastDate");

        // Default roast date: 7 days ago (peak flavor window)
        const weekAgo = new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0];
        roastDateInput.value = weekAgo;

        closeBtn.addEventListener("click", closeAddBagModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeAddBagModal();
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const coffeeName = document.getElementById("newBagCoffeeName").value;
            const roaster = document.getElementById("newBagRoaster").value;
            const roastDate = document.getElementById("newBagRoastDate").value;
            const initialWeight = document.getElementById("newBagWeight").value;
            const price = document.getElementById("newBagPrice").value;
            const notes = document.getElementById("newBagNotes").value;

            const submitBtn = document.getElementById("saveBagSubmitBtn");
            submitBtn.disabled = true;
            submitBtn.textContent = "Adding Bag...";

            try {
                await addBag({
                    coffeeName,
                    roaster,
                    roastDate,
                    initialWeight,
                    price,
                    notes
                });

                closeAddBagModal();

                // Show success toast
                if (window.SipwiseBookmarks && window.SipwiseBookmarks.showToast) {
                    window.SipwiseBookmarks.showToast(`Added "${coffeeName}" (${initialWeight}g) to your stash! ☕`);
                }

                // If on beans.html, re-render inventory
                const invGrid = document.getElementById("myBagsGrid");
                if (invGrid) renderBagsGrid(invGrid);
            } catch (err) {
                alert(err.message || "Failed to add coffee bag.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Add Bag to My Beans ☕";
            }
        });
    }

    function openAddBagModal(prefill = {}) {
        ensureAddBagModal();
        const modal = document.getElementById("sipwiseAddBagModal");

        if (prefill.coffeeName) {
            const el = document.getElementById("newBagCoffeeName");
            if (el) el.value = prefill.coffeeName;
        }
        if (prefill.roaster) {
            const el = document.getElementById("newBagRoaster");
            if (el) el.value = prefill.roaster;
        }
        if (prefill.price) {
            const el = document.getElementById("newBagPrice");
            if (el) el.value = prefill.price;
        }

        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeAddBagModal() {
        const modal = document.getElementById("sipwiseAddBagModal");
        if (modal) {
            modal.classList.remove("is-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    /**
     * Render the Bags Inventory Grid
     */
    async function renderBagsGrid(containerEl) {
        if (!containerEl) return;
        const bags = await getBags("all");
        const activeBags = bags.filter((b) => b.status === "active");

        if (activeBags.length === 0) {
            containerEl.innerHTML = `
                <div class="empty-stash-card">
                    <span class="empty-icon">☕</span>
                    <h4>No active bags in your stash</h4>
                    <p>Track your whole-bean purchases, roast dates, and remaining grams automatically as you brew.</p>
                    <button type="button" class="button-primary" onclick="SipwiseInventory.openAddBagModal()">
                        + Add Your First Coffee Bag
                    </button>
                </div>
            `;
            return;
        }

        containerEl.innerHTML = activeBags
            .map((bag) => {
                const daysOff = getDaysOffRoast(bag.roastDate);
                const freshness = getFreshnessStatus(daysOff);
                const percent = Math.min(100, Math.round((bag.remainingWeightGrams / bag.initialWeightGrams) * 100));
                const cupsLeft = Math.floor(bag.remainingWeightGrams / 15);

                const isLow = bag.remainingWeightGrams <= 30;

                return `
                <article class="coffee-bag-card ${isLow ? "is-low-stock" : ""}" data-bag-id="${bag.id}">
                    <div class="bag-card-top">
                        <div>
                            <span class="bag-roaster-label">${bag.roaster}</span>
                            <h4 class="bag-coffee-title">${bag.coffeeName}</h4>
                        </div>
                        <span class="freshness-badge freshness-${freshness.tone}">${freshness.label}</span>
                    </div>

                    <!-- Visual Inventory Meter -->
                    <div class="bag-meter-wrap">
                        <div class="meter-label-row">
                            <span>REMAINING COFFEE</span>
                            <strong class="meter-weight-text">${bag.remainingWeightGrams}g <span class="meter-pct">(${cupsLeft} ${cupsLeft === 1 ? "cup" : "cups"} left)</span></strong>
                        </div>
                        <div class="bag-progress-bar">
                            <div class="bag-progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>

                    <div class="bag-specs-row">
                        <span>🗓 Roasted: ${bag.roastDate}</span>
                        <span>•</span>
                        <span>📦 Bag size: ${bag.initialWeightGrams}g</span>
                        ${bag.priceInr ? `<span>• ₹${bag.priceInr}</span>` : ""}
                    </div>

                    ${bag.notes ? `<p class="bag-notes-text">"${bag.notes}"</p>` : ""}

                    <div class="bag-actions-footer">
                        <button type="button" class="bag-brew-btn" onclick="SipwiseInventory.brewFromBag('${bag.id}')">
                            Brew this bag ⏱
                        </button>
                        <button type="button" class="bag-delete-btn" onclick="SipwiseInventory.deleteBag('${bag.id}')" title="Archive / Delete bag">
                            ✕
                        </button>
                    </div>
                </article>
            `;
            })
            .join("");
    }

    /**
     * Shortcut to start brew from a specific bag
     */
    async function brewFromBag(bagId) {
        const bag = await getBagById(bagId);
        if (!bag) return;

        // Redirect or scroll to calculator
        const calc = document.getElementById("calculator");
        if (calc) {
            calc.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.location.href = `brew-guide.html#calculator`;
        }
    }

    function updateInventoryBadges() {
        const bags = getLocalBags();
        const activeBags = bags.filter((b) => b.status === "active");
        const activeCount = activeBags.length;
        const totalGrams = Math.round(activeBags.reduce((sum, b) => sum + b.remainingWeightGrams, 0));

        document.querySelectorAll(".inventory-count-badge").forEach((badge) => {
            badge.textContent = activeCount;
        });

        const dashGrams = document.getElementById("dashGramsCount");
        const dashBags = document.getElementById("dashBagsCount");
        if (dashGrams) dashGrams.textContent = `${totalGrams}g`;
        if (dashBags) dashBags.textContent = `${activeCount} active ${activeCount === 1 ? "bag" : "bags"}`;
    }

    // Public API
    window.SipwiseInventory = {
        getBags,
        getBagById,
        addBag,
        deductFromBag,
        deleteBag: async (id) => {
            if (confirm("Remove this bag from your active inventory?")) {
                await deleteBag(id);
                const invGrid = document.getElementById("myBagsGrid");
                if (invGrid) renderBagsGrid(invGrid);
            }
        },
        getInventoryStats,
        openAddBagModal,
        closeAddBagModal,
        renderBagsGrid,
        brewFromBag,
        updateBadges: updateInventoryBadges
    };

    document.addEventListener("DOMContentLoaded", () => {
        initSupabase();
        updateInventoryBadges();
        const grid = document.getElementById("myBagsGrid");
        if (grid) renderBagsGrid(grid);
    });

    window.addEventListener("sipwise:auth-changed", () => {
        updateInventoryBadges();
        const grid = document.getElementById("myBagsGrid");
        if (grid) renderBagsGrid(grid);
    });
})();
