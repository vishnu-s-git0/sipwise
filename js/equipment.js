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
        if (window.SipwiseToast) {
            window.SipwiseToast.show(`Added ${newItem.name} to Equipment Locker ⚙️`, "success");
        }
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
        if (window.SipwiseToast) {
            window.SipwiseToast.show("Equipment removed", "info");
        }
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
                <div class="empty-state-notice">
                    <p>No equipment logged yet. Add your grinder or brewer to dial in your dialled-in clicks!</p>
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

    /**
     * Equipment Locker Modal logic
     */
    function ensureEquipmentModal() {
        if (document.getElementById("sipwiseEquipmentModal")) return;

        const modalHTML = `
        <div class="auth-modal-overlay" id="sipwiseEquipmentModal" style="display: none;">
            <div class="auth-modal-card equipment-modal-card">
                <button type="button" class="auth-close-btn" id="equipmentCloseBtn">&times;</button>
                <div class="auth-modal-header">
                    <h2>⚙️ My Equipment Locker</h2>
                    <p>Manage your grinders, brewers, and dial-in click presets for quick kitchen logging.</p>
                </div>

                <div class="equipment-tabs">
                    <div class="equipment-list" id="equipmentLockerList"></div>
                </div>

                <div class="add-equipment-form-box">
                    <h3>+ Add Gear to Locker</h3>
                    <form id="addEquipmentForm">
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
                            <div class="auth-field-group" style="flex: 1;">
                                <label for="eqBrand">Brand / Roaster</label>
                                <input type="text" id="eqBrand" placeholder="e.g. Comandante, Fellow, Hario">
                            </div>
                            <div class="auth-field-group" style="flex: 1.5;">
                                <label for="eqClicks">Default Dial-in Clicks / Notes</label>
                                <input type="text" id="eqClicks" placeholder="e.g. 24 clicks for Pour-over">
                            </div>
                        </div>

                        <button type="submit" class="auth-submit-btn">Save Equipment to Locker</button>
                    </form>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modal = document.getElementById("sipwiseEquipmentModal");
        const closeBtn = document.getElementById("equipmentCloseBtn");
        const form = document.getElementById("addEquipmentForm");

        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const type = document.getElementById("eqType").value;
            const name = document.getElementById("eqName").value;
            const brand = document.getElementById("eqBrand").value;
            const clicks = document.getElementById("eqClicks").value;

            if (!name) return;

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
        const modal = document.getElementById("sipwiseEquipmentModal");
        if (modal) modal.style.display = "flex";
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
        renderEquipmentLocker
    };

    document.addEventListener("DOMContentLoaded", () => {
        initClient();
    });
})();
