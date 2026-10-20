/**
 * Sipwise Equipment Locker & Grinder Dial-In Engine
 * Tracks grinders, brewers, kettles, scales, and click dial-in presets.
 * Works offline in localStorage and synchronizes with Supabase public.user_equipment.
 */

(function () {
    "use strict";

    const STORAGE_KEY = "sipwise_equipment";
    let supabaseClient = null;

    // Default equipment preset for a new coffee enthusiast
    const DEFAULT_EQUIPMENT = [
        {
            id: "eq_grinder_timemore",
            equipmentType: "grinder",
            name: "Timemore Chestnut C2",
            brand: "Timemore",
            defaultClicks: "14 clicks (V60) / 11 clicks (AeroPress)",
            isDefault: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "eq_brewer_v60",
            equipmentType: "brewer",
            name: "Hario V60 (Plastic 02)",
            brand: "Hario",
            defaultClicks: "14 clicks",
            isDefault: true,
            createdAt: new Date().toISOString()
        },
        {
            id: "eq_brewer_aeropress",
            equipmentType: "brewer",
            name: "AeroPress Original",
            brand: "AeroPress",
            defaultClicks: "11 clicks",
            isDefault: false,
            createdAt: new Date().toISOString()
        },
        {
            id: "eq_brewer_filter",
            equipmentType: "brewer",
            name: "South Indian Brass Filter",
            brand: "Traditional",
            defaultClicks: "8 clicks (Fine)",
            isDefault: false,
            createdAt: new Date().toISOString()
        }
    ];

    function initClient() {
        if (window.sipwiseSupabase && !supabaseClient) {
            supabaseClient = window.sipwiseSupabase;
        }
    }

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

    function getLocalEquipment() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn("Could not parse local equipment:", e);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EQUIPMENT));
        return DEFAULT_EQUIPMENT;
    }

    function saveLocalEquipment(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    /**
     * Get all equipment items
     */
    async function getEquipment() {
        initClient();
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;

        if (supabaseClient && user) {
            try {
                const { data, error } = await supabaseClient
                    .from("user_equipment")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (!error && data && data.length > 0) {
                    return data.map((d) => ({
                        id: d.id,
                        equipmentType: d.equipment_type,
                        name: d.name,
                        brand: d.brand || "",
                        defaultClicks: d.default_clicks || "",
                        isDefault: false,
                        createdAt: d.created_at
                    }));
                }
            } catch (err) {
                console.warn("Supabase equipment fetch error:", err);
            }
        }

        return getLocalEquipment();
    }

    /**
     * Add new equipment
     */
    async function addEquipment(item) {
        initClient();
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;

        const newItem = {
            id: "eq_" + Math.random().toString(36).substring(2, 9),
            equipmentType: item.equipmentType || "brewer",
            name: item.name.trim(),
            brand: (item.brand || "").trim(),
            defaultClicks: (item.defaultClicks || "").trim(),
            isDefault: !!item.isDefault,
            createdAt: new Date().toISOString()
        };

        const local = getLocalEquipment();
        local.unshift(newItem);
        saveLocalEquipment(local);

        if (supabaseClient && user) {
            try {
                await supabaseClient.from("user_equipment").insert({
                    user_id: user.id,
                    equipment_type: newItem.equipmentType,
                    name: newItem.name,
                    brand: newItem.brand,
                    default_clicks: newItem.defaultClicks
                });
            } catch (err) {
                console.warn("Could not sync equipment to Supabase:", err);
            }
        }

        renderEquipmentLocker();
        showToast(`Added ${newItem.name} to Locker ⚙️`);
        return newItem;
    }

    /**
     * Delete equipment
     */
    async function deleteEquipment(id) {
        initClient();
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;

        let local = getLocalEquipment();
        local = local.filter((i) => i.id !== id);
        saveLocalEquipment(local);

        if (supabaseClient && user) {
            try {
                await supabaseClient.from("user_equipment").delete().eq("id", id);
            } catch (err) {
                console.warn("Could not delete equipment in Supabase:", err);
            }
        }

        renderEquipmentLocker();
        showToast("Equipment removed from locker");
    }

    /**
     * Render the Equipment Locker Drawer/Modal
     */
    async function renderEquipmentLocker() {
        const listEl = document.getElementById("equipmentLockerList");
        if (!listEl) return;

        const items = await getEquipment();

        if (items.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state-notice" style="padding: 24px; text-align: center; color: var(--muted);">
                    <p>No equipment in your locker yet. Add your grinder or brewer below!</p>
                </div>
            `;
            return;
        }

        const icons = {
            grinder: "⚙️",
            brewer: "☕",
            kettle: "🫖",
            scale: "⚖️"
        };

        const noteLabels = {
            grinder: "⚙️ Clicks:",
            brewer: "☕ Grind & Recipe Notes:",
            kettle: "🫖 Temp & Flow:",
            scale: "⚖️ Mode:"
        };

        listEl.innerHTML = items
            .map((item) => {
                const icon = icons[item.equipmentType] || "🔧";
                const prefix = noteLabels[item.equipmentType] || "🎯 Notes:";
                return `
                <div class="equipment-card" data-id="${item.id}">
                    <div class="equipment-card-icon">${icon}</div>
                    <div class="equipment-card-info">
                        <div class="equipment-card-title">
                            <strong>${escapeHTML(item.name)}</strong>
                            <span class="equipment-type-badge">${escapeHTML(item.equipmentType)}</span>
                        </div>
                        ${item.brand ? `<div class="equipment-brand">${escapeHTML(item.brand)}</div>` : ""}
                        ${item.defaultClicks ? `<div class="equipment-clicks"><em>${prefix} ${escapeHTML(item.defaultClicks)}</em></div>` : ""}
                    </div>
                    <button type="button" class="equipment-del-btn" onclick="window.SipwiseEquipment.deleteEquipment('${item.id}')" title="Remove equipment">✕</button>
                </div>
            `;
            })
            .join("");
    }

    const BRAND_PRESETS = {
        brewer: ["Hario", "AeroPress", "Bialetti", "Kalita", "Origami", "Bodum", "Traditional Brass", "Fellow"],
        grinder: ["Timemore", "Comandante", "1Zpresso", "Fellow", "Baratza", "Eureka", "Kingrinder", "Porlex"],
        kettle: ["Fellow", "Hario", "Brewista", "Timemore", "Bonavita"],
        scale: ["Timemore", "Acaia", "Hario", "Weightman", "Fellow"]
    };

    const EQUIPMENT_PRESETS = {
        brewer: [
            { name: "Hario V60 (Plastic 02)", brand: "Hario", clicks: "14 clicks (Medium-Fine)" },
            { name: "AeroPress Original", brand: "AeroPress", clicks: "11 clicks (Medium-Fine)" },
            { name: "South Indian Brass Filter", brand: "Traditional Brass", clicks: "8 clicks (Fine)" },
            { name: "Bialetti Moka Express", brand: "Bialetti", clicks: "9 clicks (Fine-Medium)" },
            { name: "Kalita Wave 185", brand: "Kalita", clicks: "15 clicks (Medium)" },
            { name: "Hario V60 Switch", brand: "Hario", clicks: "14 clicks" },
            { name: "Origami Dripper", brand: "Origami", clicks: "14 clicks" },
            { name: "Bodum French Press", brand: "Bodum", clicks: "22 clicks (Coarse)" },
            { name: "Flair 58 Espresso", brand: "Flair", clicks: "5 clicks (Espresso)" },
            { name: "Chemex 6-Cup", brand: "Chemex", clicks: "18 clicks (Medium-Coarse)" }
        ],
        grinder: [
            { name: "Timemore Chestnut C2", brand: "Timemore", clicks: "14 clicks (V60) / 11 clicks (AeroPress)" },
            { name: "Timemore Chestnut C3", brand: "Timemore", clicks: "13 clicks (V60) / 10 clicks (AeroPress)" },
            { name: "Comandante C40 MK4", brand: "Comandante", clicks: "24 clicks (Pour-Over)" },
            { name: "1Zpresso JX-Pro", brand: "1Zpresso", clicks: "3.2 rotations (Pour-Over)" },
            { name: "1Zpresso Q2", brand: "1Zpresso", clicks: "18 clicks (V60)" },
            { name: "Baratza Encore", brand: "Baratza", clicks: "Setting 14 (V60) / 11 (AeroPress)" },
            { name: "Baratza Encore ESP", brand: "Baratza", clicks: "Setting 16 (Pour-over)" },
            { name: "Fellow Ode Gen 2", brand: "Fellow", clicks: "Setting 4 (Pour-over)" },
            { name: "Fellow Opus", brand: "Fellow", clicks: "Setting 5.5" },
            { name: "Kingrinder K6", brand: "Kingrinder", clicks: "85 clicks" },
            { name: "Eureka Mignon Specialita", brand: "Eureka", clicks: "Setting 1.5 (Espresso)" }
        ],
        kettle: [
            { name: "Fellow Stagg EKG Electric", brand: "Fellow", clicks: "92°C Pour-Over" },
            { name: "Hario V60 'Buono' Kettle", brand: "Hario", clicks: "Gooseneck Flow" },
            { name: "Brewista Artisan Variable Kettle", brand: "Brewista", clicks: "93°C Setting" },
            { name: "Timemore Smart Fish Kettle", brand: "Timemore", clicks: "91°C Pour-Over" },
            { name: "Bonavita Variable Temp Kettle", brand: "Bonavita", clicks: "92°C Setting" }
        ],
        scale: [
            { name: "Timemore Black Mirror Basic 2", brand: "Timemore", clicks: "0.1g Timer & Flow Rate" },
            { name: "Timemore Black Mirror Nano", brand: "Timemore", clicks: "0.1g Compact Espresso Scale" },
            { name: "Hario V60 Drip Scale", brand: "Hario", clicks: "0.1g Dual Display" },
            { name: "Acaia Pearl", brand: "Acaia", clicks: "Precision Brewing Scale" },
            { name: "Fellow Tally Pro Precision Scale", brand: "Fellow", clicks: "Brew Assist Scale" }
        ]
    };

    const TYPE_NOTE_CONFIG = {
        grinder: {
            label: "Grinder Clicks / Calibration",
            placeholder: "e.g. 14 clicks (V60) / 11 clicks (AeroPress)",
            hint: "Clicks counted from zero on your manual or electric grinder."
        },
        brewer: {
            label: "Target Grind Size & Recipe Notes",
            placeholder: "e.g. Medium-Fine grind, 92°C, 3-pour technique",
            hint: "Recommended grind consistency and water temperature for this brewer."
        },
        kettle: {
            label: "Default Temperature & Pour Flow",
            placeholder: "e.g. 92°C Pour-Over, steady center stream",
            hint: "Target water temperature and gooseneck flow rate."
        },
        scale: {
            label: "Timer Mode & Scale Notes",
            placeholder: "e.g. Auto-tare & auto-timer on first drop",
            hint: "Display resolution and automatic timer mode."
        }
    };

    function updateNoteFieldConfig(type) {
        const label = document.getElementById("eqClicksLabel");
        const input = document.getElementById("eqClicks");
        const hint = document.getElementById("eqClicksHint");
        const cfg = TYPE_NOTE_CONFIG[type] || TYPE_NOTE_CONFIG.brewer;
        if (label) label.textContent = cfg.label;
        if (input) input.placeholder = cfg.placeholder;
        if (hint) hint.textContent = cfg.hint;
    }

    function updateBrandChips(type) {
        const row = document.getElementById("brandSuggestionsRow");
        if (!row) return;
        const brands = BRAND_PRESETS[type] || BRAND_PRESETS.brewer;
        row.innerHTML = `<span style="font-size:10px; color:var(--muted); font-weight:600; text-transform:uppercase;">Popular:</span> ` +
            brands.map(b => `<button type="button" class="brand-chip" data-brand="${b}">${b}</button>`).join("");

        row.querySelectorAll(".brand-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const brandInput = document.getElementById("eqBrand");
                if (brandInput) {
                    brandInput.value = chip.dataset.brand;
                    brandInput.focus();
                }
            });
        });
    }

    function updateEquipmentChips(type) {
        const row = document.getElementById("equipmentSuggestionsRow");
        const datalist = document.getElementById("popularEquipmentDatalist");
        const presets = EQUIPMENT_PRESETS[type] || EQUIPMENT_PRESETS.brewer;

        if (datalist) {
            datalist.innerHTML = presets.map(p => `<option value="${p.name}">`).join("");
        }

        if (row) {
            row.innerHTML = `<span style="font-size:10px; color:var(--muted); font-weight:600; text-transform:uppercase;">Popular Models:</span> ` +
                presets.slice(0, 6).map(p => `<button type="button" class="brand-chip" data-name="${p.name}" data-brand="${p.brand}" data-clicks="${p.clicks}">${p.name.split(" (")[0]}</button>`).join("");

            row.querySelectorAll(".brand-chip").forEach(chip => {
                chip.addEventListener("click", () => {
                    const nameInput = document.getElementById("eqName");
                    const brandInput = document.getElementById("eqBrand");
                    const clicksInput = document.getElementById("eqClicks");

                    if (nameInput) nameInput.value = chip.dataset.name;
                    if (brandInput && (!brandInput.value || chip.dataset.brand)) brandInput.value = chip.dataset.brand;
                    if (clicksInput && (!clicksInput.value || chip.dataset.clicks)) clicksInput.value = chip.dataset.clicks;
                    if (nameInput) nameInput.focus();
                });
            });
        }
    }

    /**
     * Equipment Locker Modal logic
     */
    function ensureEquipmentModal() {
        if (document.getElementById("sipwiseEquipmentModal")) return;

        const modalHTML = `
        <div id="sipwiseEquipmentModal" class="sipwise-modal-overlay" aria-hidden="true">
            <div class="sipwise-modal-dialog equipment-modal-card" role="dialog" aria-modal="true" aria-labelledby="equipmentHeading">
                <button type="button" class="modal-close-btn" id="equipmentCloseBtn" aria-label="Close modal">✕</button>
                
                <div class="auth-modal-header">
                    <span class="auth-brand-badge">GEAR &amp; DIAL-IN</span>
                    <h2 id="equipmentHeading">⚙️ My Equipment Locker</h2>
                    <p class="auth-modal-sub">Manage your grinders, brewers, and dial-in click presets for quick kitchen logging.</p>
                </div>

                <div class="equipment-tabs">
                    <div class="equipment-list" id="equipmentLockerList"></div>
                </div>

                <div class="add-equipment-form-box">
                    <h3>+ Add Gear to Locker</h3>
                    <form id="addEquipmentForm" class="auth-form-content">
                        <div class="log-form-row">
                            <div class="auth-field-group" style="flex: 1;">
                                <label for="eqType">Gear Type</label>
                                <select id="eqType">
                                    <option value="grinder">Grinder ⚙️</option>
                                    <option value="brewer" selected>Brewer ☕</option>
                                    <option value="kettle">Kettle 🫖</option>
                                    <option value="scale">Digital Scale ⚖️</option>
                                </select>
                            </div>
                            <div class="auth-field-group" style="flex: 2;">
                                <label for="eqName">Equipment Name</label>
                                <input type="text" id="eqName" list="popularEquipmentDatalist" placeholder="e.g. Hario V60, Timemore C2, AeroPress" autocomplete="off" required>
                                <datalist id="popularEquipmentDatalist"></datalist>
                                <div class="brand-suggestions-row" id="equipmentSuggestionsRow">
                                    <!-- Dynamic equipment model suggestion chips -->
                                </div>
                            </div>
                        </div>

                        <div class="log-form-row">
                            <div class="auth-field-group" style="flex: 1.2;">
                                <label for="eqBrand">Brand</label>
                                <input type="text" id="eqBrand" list="popularBrandsDatalist" placeholder="e.g. Timemore, Hario, Fellow" autocomplete="off">
                                <datalist id="popularBrandsDatalist">
                                    <option value="Hario">
                                    <option value="Timemore">
                                    <option value="AeroPress">
                                    <option value="Fellow">
                                    <option value="Comandante">
                                    <option value="1Zpresso">
                                    <option value="Baratza">
                                    <option value="Bialetti">
                                    <option value="Kalita">
                                    <option value="Origami">
                                    <option value="Eureka">
                                    <option value="Bodum">
                                    <option value="Flair">
                                    <option value="Traditional Brass">
                                    <option value="Brewista">
                                    <option value="Acaia">
                                    <option value="Kingrinder">
                                </datalist>
                                <div class="brand-suggestions-row" id="brandSuggestionsRow">
                                    <!-- Dynamic brand suggestion chips populated based on gear type -->
                                </div>
                            </div>
                            <div class="auth-field-group" style="flex: 1.2;">
                                <label for="eqClicks" id="eqClicksLabel">Target Grind Size &amp; Recipe Notes</label>
                                <input type="text" id="eqClicks" placeholder="e.g. Medium-Fine grind, 92°C, 3-pour technique">
                                <span id="eqClicksHint" style="font-size: 10.5px; color: var(--muted); margin-top: 3px; display: block;">Recommended grind consistency and water temperature for this brewer.</span>
                            </div>
                        </div>

                        <button type="submit" class="auth-submit-btn" style="margin-top: 12px;">Save Equipment to Locker</button>
                    </form>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modal = document.getElementById("sipwiseEquipmentModal");
        const closeBtn = document.getElementById("equipmentCloseBtn");
        const form = document.getElementById("addEquipmentForm");

        closeBtn.addEventListener("click", closeEquipmentModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeEquipmentModal();
        });

        const typeSelect = document.getElementById("eqType");
        const nameInput = document.getElementById("eqName");

        if (typeSelect) {
            typeSelect.addEventListener("change", () => {
                updateBrandChips(typeSelect.value);
                updateEquipmentChips(typeSelect.value);
                updateNoteFieldConfig(typeSelect.value);
            });
            updateBrandChips(typeSelect.value);
            updateEquipmentChips(typeSelect.value);
            updateNoteFieldConfig(typeSelect.value);
        }

        if (nameInput) {
            nameInput.addEventListener("input", () => {
                const val = nameInput.value.trim().toLowerCase();
                const type = typeSelect ? typeSelect.value : "brewer";
                const presets = EQUIPMENT_PRESETS[type] || [];
                const found = presets.find(p => p.name.toLowerCase() === val || p.name.toLowerCase().startsWith(val));
                if (found) {
                    const brandInput = document.getElementById("eqBrand");
                    const clicksInput = document.getElementById("eqClicks");
                    if (brandInput && !brandInput.value) brandInput.value = found.brand;
                    if (clicksInput && !clicksInput.value) clicksInput.value = found.clicks;
                }
            });
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const type = document.getElementById("eqType").value;
            const name = document.getElementById("eqName").value;
            const brand = document.getElementById("eqBrand").value;
            const clicks = document.getElementById("eqClicks").value;

            if (!name || !name.trim()) return;

            await addEquipment({
                equipmentType: type,
                name: name,
                brand: brand,
                defaultClicks: clicks
            });

            form.reset();
        });
    }

    function openEquipmentModal() {
        ensureEquipmentModal();
        renderEquipmentLocker();
        const typeSelect = document.getElementById("eqType");
        if (typeSelect) {
            updateBrandChips(typeSelect.value);
            updateEquipmentChips(typeSelect.value);
            updateNoteFieldConfig(typeSelect.value);
        }
        const modal = document.getElementById("sipwiseEquipmentModal");
        if (modal) {
            modal.classList.add("is-visible");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }
    }

    function closeEquipmentModal() {
        const modal = document.getElementById("sipwiseEquipmentModal");
        if (modal) {
            modal.classList.remove("is-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    function escapeHTML(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Expose API
    window.SipwiseEquipment = {
        getEquipment,
        addEquipment,
        deleteEquipment,
        openEquipmentModal,
        closeEquipmentModal,
        renderEquipmentLocker
    };

    document.addEventListener("DOMContentLoaded", () => {
        initClient();
        if (window.location.hash === "#locker") {
            setTimeout(openEquipmentModal, 200);
        }
    });

    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#locker") {
            openEquipmentModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeEquipmentModal();
        }
    });
})();
