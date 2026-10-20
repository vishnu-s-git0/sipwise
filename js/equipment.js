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

        listEl.innerHTML = items
            .map((item) => {
                const icon = icons[item.equipmentType] || "🔧";
                return `
                <div class="equipment-card" data-id="${item.id}">
                    <div class="equipment-card-icon">${icon}</div>
                    <div class="equipment-card-info">
                        <div class="equipment-card-title">
                            <strong>${escapeHTML(item.name)}</strong>
                            <span class="equipment-type-badge">${escapeHTML(item.equipmentType)}</span>
                        </div>
                        ${item.brand ? `<div class="equipment-brand">${escapeHTML(item.brand)}</div>` : ""}
                        ${item.defaultClicks ? `<div class="equipment-clicks">🎯 <em>${escapeHTML(item.defaultClicks)}</em></div>` : ""}
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

    function updateBrandChips(type) {
        const row = document.getElementById("brandSuggestionsRow");
        if (!row) return;
        const brands = BRAND_PRESETS[type] || BRAND_PRESETS.brewer;
        row.innerHTML = `<span style="font-size:10.5px; color:var(--muted); font-weight:600; text-transform:uppercase;">Popular:</span> ` +
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
                                <input type="text" id="eqName" placeholder="e.g. Comandante C40 MK4 or Kalita Wave" required>
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
                                <label for="eqClicks">Dial-in Clicks / Notes</label>
                                <input type="text" id="eqClicks" placeholder="e.g. 14 clicks (V60) / 10 clicks (AeroPress)">
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
        if (typeSelect) {
            typeSelect.addEventListener("change", () => {
                updateBrandChips(typeSelect.value);
            });
            updateBrandChips(typeSelect.value);
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
        if (typeSelect) updateBrandChips(typeSelect.value);
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
