/**
 * Sipwise — Saved Recommendations & Bookmarks Shelf
 * Dual-Mode: Supabase `saved_items` table or Local Sandbox Store.
 */

(function () {
    const STORAGE_KEY_PREFIX = "sipwise_saved_items_";
    let supabaseClient = null;

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

    /**
     * Get local saved items
     */
    function getLocalSavedItems() {
        try {
            const raw = localStorage.getItem(getStorageKey());
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn(e);
        }
        return [];
    }

    function saveLocalSavedItems(items) {
        localStorage.setItem(getStorageKey(), JSON.stringify(items));
        updateUI();
    }

    /**
     * Read all saved items
     */
    async function getSavedItems() {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) return getLocalSavedItems();

        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from("saved_items")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                return data.map((item) => ({
                    id: item.id,
                    itemType: item.item_type,
                    itemId: item.item_id,
                    itemTitle: item.item_title,
                    itemSubtitle: item.item_subtitle,
                    createdAt: item.created_at
                }));
            }
        }

        return getLocalSavedItems();
    }

    function isBookmarked(itemType, itemId) {
        const items = getLocalSavedItems();
        return items.some((it) => it.itemType === itemType && it.itemId === itemId);
    }

    /**
     * Toggle bookmark state
     */
    async function toggleBookmark(item) {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) {
            if (window.SipwiseAuth) {
                window.SipwiseAuth.openAuthModal("signin", () => {
                    toggleBookmark(item);
                });
            }
            return;
        }

        let items = getLocalSavedItems();
        const existingIdx = items.findIndex((it) => it.itemType === item.itemType && it.itemId === item.itemId);

        if (existingIdx !== -1) {
            // Remove
            const removed = items.splice(existingIdx, 1)[0];
            saveLocalSavedItems(items);

            if (supabaseClient) {
                await supabaseClient
                    .from("saved_items")
                    .delete()
                    .eq("item_type", item.itemType)
                    .eq("item_id", item.itemId);
            }
            showToast(`Removed "${item.itemTitle}" from your shelf.`);
        } else {
            // Add
            const newItem = {
                id: "save_" + Math.random().toString(36).substring(2, 9),
                itemType: item.itemType,
                itemId: item.itemId,
                itemTitle: item.itemTitle,
                itemSubtitle: item.itemSubtitle || "",
                createdAt: new Date().toISOString()
            };
            items.unshift(newItem);
            saveLocalSavedItems(items);

            if (supabaseClient) {
                await supabaseClient.from("saved_items").insert({
                    user_id: user.id,
                    item_type: item.itemType,
                    item_id: item.itemId,
                    item_title: item.itemTitle,
                    item_subtitle: item.itemSubtitle || ""
                });
            }
            showToast(`Saved "${item.itemTitle}" to your shelf! ♡`);
        }

        updateUI();
    }

    /**
     * Show lightweight notification toast
     */
    function showToast(message) {
        let toast = document.getElementById("sipwiseToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "sipwiseToast";
            toast.className = "sipwise-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("is-visible");
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2800);
    }

    /**
     * Slide-over "My Saved Shelf" Drawer HTML injection
     */
    function ensureShelfDrawer() {
        if (document.getElementById("savedShelfDrawer")) return;

        const drawerHTML = `
        <div id="savedShelfOverlay" class="shelf-overlay" aria-hidden="true"></div>
        <aside id="savedShelfDrawer" class="shelf-drawer" aria-labelledby="shelfTitle" aria-hidden="true">
            <div class="shelf-header">
                <div>
                    <span class="auth-brand-badge">PERSONAL REPOSITORY</span>
                    <h2 id="shelfTitle">My Saved Shelf</h2>
                </div>
                <button type="button" class="drawer-close-btn" id="shelfCloseBtn" aria-label="Close shelf">✕</button>
            </div>

            <div class="shelf-filter-chips" role="tablist">
                <button type="button" class="shelf-chip active" data-filter="all">All Saved (<span id="countAll">0</span>)</button>
                <button type="button" class="shelf-chip" data-filter="journal">📓 Brew Journal (<span id="countJournal">0</span>)</button>
                <button type="button" class="shelf-chip" data-filter="roaster">Roasters (<span id="countRoaster">0</span>)</button>
                <button type="button" class="shelf-chip" data-filter="bean">Beans (<span id="countBean">0</span>)</button>
                <button type="button" class="shelf-chip" data-filter="gear">Gear (<span id="countGear">0</span>)</button>
            </div>

            <div class="shelf-content-body" id="shelfItemsList">
                <!-- Rendered dynamically -->
            </div>
        </aside>`;

        document.body.insertAdjacentHTML("beforeend", drawerHTML);

        const overlay = document.getElementById("savedShelfOverlay");
        const drawer = document.getElementById("savedShelfDrawer");
        const closeBtn = document.getElementById("shelfCloseBtn");
        const chips = document.querySelectorAll(".shelf-filter-chips .shelf-chip");

        closeBtn.addEventListener("click", closeShelfDrawer);
        overlay.addEventListener("click", closeShelfDrawer);

        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                chips.forEach((c) => c.classList.remove("active"));
                chip.classList.add("active");
                renderShelfItems(chip.dataset.filter);
            });
        });
    }

    function openShelfDrawer(initialFilter = "all") {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) {
            if (window.SipwiseAuth) {
                window.SipwiseAuth.openAuthModal("signin", () => {
                    openShelfDrawer(initialFilter);
                });
            }
            return;
        }

        ensureShelfDrawer();
        const overlay = document.getElementById("savedShelfOverlay");
        const drawer = document.getElementById("savedShelfDrawer");

        overlay.classList.add("is-visible");
        drawer.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        drawer.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        // Select matching chip
        const chips = drawer.querySelectorAll(".shelf-filter-chips .shelf-chip");
        chips.forEach((c) => {
            c.classList.toggle("active", c.dataset.filter === initialFilter);
        });

        renderShelfItems(initialFilter);
    }

    function closeShelfDrawer() {
        const overlay = document.getElementById("savedShelfOverlay");
        const drawer = document.getElementById("savedShelfDrawer");
        if (overlay && drawer) {
            overlay.classList.remove("is-visible");
            drawer.classList.remove("is-open");
            overlay.setAttribute("aria-hidden", "true");
            drawer.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    async function renderShelfItems(activeFilter = "all") {
        const listContainer = document.getElementById("shelfItemsList");
        if (!listContainer) return;

        // If journal tab is selected, render the journal view
        if (activeFilter === "journal") {
            if (window.SipwiseJournal) {
                window.SipwiseJournal.renderJournalView(listContainer);
                window.SipwiseJournal.updateBadge();
            }
            return;
        }

        const items = await getSavedItems();

        // Update counts
        const countAll = items.length;
        const countRoaster = items.filter((i) => i.itemType === "roaster").length;
        const countBean = items.filter((i) => i.itemType === "bean").length;
        const countGear = items.filter((i) => i.itemType === "gear").length;

        const cAllEl = document.getElementById("countAll");
        const cRoasterEl = document.getElementById("countRoaster");
        const cBeanEl = document.getElementById("countBean");
        const cGearEl = document.getElementById("countGear");

        if (cAllEl) cAllEl.textContent = countAll;
        if (cRoasterEl) cRoasterEl.textContent = countRoaster;
        if (cBeanEl) cBeanEl.textContent = countBean;
        if (cGearEl) cGearEl.textContent = countGear;

        const filtered = activeFilter === "all" ? items : items.filter((i) => i.itemType === activeFilter);

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="shelf-empty-state">
                    <span class="empty-icon">☕</span>
                    <h3>Your shelf is empty</h3>
                    <p>Click the bookmark icon (♡) on any roaster, single-estate bean, or brew guide to save your favorites here.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filtered
            .map((item) => {
                const icon =
                    item.itemType === "roaster" ? "🏢 Roaster" : item.itemType === "bean" ? "🌱 Single-Estate" : "⏱ Gear";

                let directLink = "#";
                if (item.itemType === "roaster") directLink = `index.html#roasters`;
                if (item.itemType === "bean") directLink = `beans.html#${item.itemId}`;
                if (item.itemType === "gear") directLink = `brew-guide.html#${item.itemId}`;

                return `
                <div class="shelf-item-card" data-id="${item.itemId}" data-type="${item.itemType}">
                    <div class="shelf-item-meta">
                        <span class="shelf-type-tag">${icon}</span>
                        <h4>${item.itemTitle}</h4>
                        ${item.itemSubtitle ? `<p class="shelf-item-sub">${item.itemSubtitle}</p>` : ""}
                    </div>
                    <div class="shelf-item-actions">
                        <a href="${directLink}" class="shelf-view-link">Open ↗</a>
                        <button type="button" class="shelf-remove-btn" title="Remove from shelf" data-type="${item.itemType}" data-id="${item.itemId}">✕</button>
                    </div>
                </div>
            `;
            })
            .join("");

        // Bind remove buttons
        listContainer.querySelectorAll(".shelf-remove-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const type = btn.dataset.type;
                const id = btn.dataset.id;
                const card = btn.closest(".shelf-item-card");
                const title = card ? card.querySelector("h4").textContent : id;
                toggleBookmark({ itemType: type, itemId: id, itemTitle: title });
            });
        });
    }

    /**
     * Update bookmark trigger buttons on the page & nav counters
     */
    function updateUI() {
        const items = getLocalSavedItems();

        // Update dropdown menu badge
        const badge = document.getElementById("dropdownShelfBadge");
        if (badge) {
            badge.textContent = items.length;
        }

        // Update all bookmark heart buttons
        document.querySelectorAll(".btn-bookmark").forEach((btn) => {
            const type = btn.dataset.type;
            const id = btn.dataset.id;
            const saved = isBookmarked(type, id);

            btn.classList.toggle("is-saved", saved);
            btn.innerHTML = saved
                ? `<span class="heart-icon">♥</span> <span class="btn-label">Saved</span>`
                : `<span class="heart-icon">♡</span> <span class="btn-label">Save</span>`;
            btn.setAttribute("aria-pressed", saved ? "true" : "false");
        });

        // Re-render shelf list if drawer is open
        const drawer = document.getElementById("savedShelfDrawer");
        if (drawer && drawer.classList.contains("is-open")) {
            const activeChip = document.querySelector(".shelf-filter-chips .shelf-chip.active");
            renderShelfItems(activeChip ? activeChip.dataset.filter : "all");
        }

        if (window.SipwiseJournal && window.SipwiseJournal.updateBadge) {
            window.SipwiseJournal.updateBadge();
        }
    }

    // Attach bookmark click handlers to any .btn-bookmark
    function bindBookmarkButtons() {
        document.querySelectorAll(".btn-bookmark").forEach((btn) => {
            if (btn._bound) return;
            btn._bound = true;
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const itemType = btn.dataset.type;
                const itemId = btn.dataset.id;
                const itemTitle = btn.dataset.title || itemId;
                const itemSubtitle = btn.dataset.subtitle || "";

                toggleBookmark({ itemType, itemId, itemTitle, itemSubtitle });
            });
        });
        updateUI();
    }

    // Public API
    window.SipwiseBookmarks = {
        isBookmarked,
        toggleBookmark,
        getSavedItems,
        openShelfDrawer,
        closeShelfDrawer,
        updateBadges: updateUI,
        bindButtons: bindBookmarkButtons
    };

    document.addEventListener("DOMContentLoaded", () => {
        initSupabase();
        bindBookmarkButtons();
        ensureShelfDrawer();
    });

    window.addEventListener("sipwise:auth-changed", () => {
        updateUI();
    });
})();
