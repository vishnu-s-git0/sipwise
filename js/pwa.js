/**
 * Sipwise Progressive Web App (PWA) & Mobile Kitchen Companion Engine
 * - Service worker registration & offline support
 * - Add-to-homescreen install prompt listener
 * - Responsive Mobile Bottom Navigation Bar (Home, My Bags, +Log Brew, Journal, Gear)
 */

(function () {
    "use strict";

    // 1. Register Service Worker
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("sw.js")
                .then((reg) => {
                    // Successfully registered
                })
                .catch((err) => {
                    console.warn("Sipwise SW registration failed:", err);
                });
        });
    }

    // 2. Add to Home Screen Prompt Handling
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPromotion();
    });

    function showInstallPromotion() {
        if (document.getElementById("pwaInstallPrompt") || localStorage.getItem("sipwise_pwa_dismissed")) {
            return;
        }

        const banner = document.createElement("div");
        banner.id = "pwaInstallPrompt";
        banner.className = "pwa-install-banner";
        banner.innerHTML = `
            <div class="pwa-install-content">
                <span class="pwa-install-icon">☕</span>
                <div class="pwa-install-text">
                    <strong>Install Sipwise</strong>
                    <span>Use as a kitchen app with offline brew logging</span>
                </div>
            </div>
            <div class="pwa-install-actions">
                <button type="button" class="pwa-btn-install" id="pwaInstallConfirm">Install</button>
                <button type="button" class="pwa-btn-dismiss" id="pwaInstallDismiss" aria-label="Dismiss">&times;</button>
            </div>
        `;
        document.body.appendChild(banner);

        document.getElementById("pwaInstallConfirm").addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                deferredPrompt = null;
            }
            banner.remove();
        });

        document.getElementById("pwaInstallDismiss").addEventListener("click", () => {
            banner.remove();
            localStorage.setItem("sipwise_pwa_dismissed", "1");
        });
    }

    // 3. Render Responsive Mobile Bottom Navigation Bar
    function renderMobileBottomNav() {
        if (document.getElementById("sipwiseMobileBottomNav")) return;

        const path = window.location.pathname.toLowerCase();
        const isHome = path.endsWith("index.html") || path.endsWith("/") || path === "";
        const isBeans = path.includes("beans.html");
        const isGuide = path.includes("brew-guide.html");
        const isBlog = path.includes("blog.html");

        const nav = document.createElement("nav");
        nav.id = "sipwiseMobileBottomNav";
        nav.className = "mobile-bottom-nav";
        nav.setAttribute("aria-label", "Mobile Kitchen Navigation");

        nav.innerHTML = `
            <a href="index.html" class="mob-nav-item ${isHome ? 'active' : ''}">
                <span class="mob-icon">🏠</span>
                <span class="mob-label">Home</span>
            </a>
            <a href="beans.html#myBeansInventory" class="mob-nav-item ${isBeans ? 'active' : ''}">
                <span class="mob-icon">🫘</span>
                <span class="mob-label">My Bags</span>
            </a>
            <button type="button" class="mob-nav-item mob-nav-quicklog" id="mobQuickLogBtn" title="Log a Brew">
                <span class="mob-icon">⚡</span>
                <span class="mob-label">Log Brew</span>
            </button>
            <button type="button" class="mob-nav-item" id="mobJournalBtn" title="Brew Journal">
                <span class="mob-icon">📓</span>
                <span class="mob-label">Journal</span>
            </button>
            <button type="button" class="mob-nav-item" id="mobGearBtn" title="My Equipment Locker">
                <span class="mob-icon">⚙️</span>
                <span class="mob-label">Locker</span>
            </button>
        `;

        document.body.appendChild(nav);

        // Bind buttons
        const quickLogBtn = document.getElementById("mobQuickLogBtn");
        if (quickLogBtn) {
            quickLogBtn.addEventListener("click", () => {
                if (window.SipwiseJournal && window.SipwiseJournal.openLogCupModal) {
                    window.SipwiseJournal.openLogCupModal();
                }
            });
        }

        const journalBtn = document.getElementById("mobJournalBtn");
        if (journalBtn) {
            journalBtn.addEventListener("click", () => {
                if (window.SipwiseBookmarks && window.SipwiseBookmarks.openShelfDrawer) {
                    window.SipwiseBookmarks.openShelfDrawer("journal");
                }
            });
        }

        const gearBtn = document.getElementById("mobGearBtn");
        if (gearBtn) {
            gearBtn.addEventListener("click", () => {
                if (window.SipwiseEquipment && window.SipwiseEquipment.openEquipmentModal) {
                    window.SipwiseEquipment.openEquipmentModal();
                }
            });
        }
    }

    // Expose API
    window.SipwisePWA = {
        showInstallPromotion
    };

    document.addEventListener("DOMContentLoaded", () => {
        renderMobileBottomNav();
    });
})();
