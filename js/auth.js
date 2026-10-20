/**
 * Sipwise — Authentication & User Identity Engine
 * Supports both Live Supabase and Local Sandbox Mode seamlessly.
 */

(function () {
    const STORAGE_KEY_USERS = "sipwise_sandbox_users";
    const STORAGE_KEY_SESSION = "sipwise_sandbox_session";

    let supabaseClient = null;
    let authSuccessCallback = null;

    // Default pre-seeded demo user
    const defaultDemoUser = {
        id: "usr_demo_441829",
        fullName: "Aditi Rao",
        email: "aditi@sipwise.coffee",
        city: "Bengaluru",
        favoriteBrew: "Hario V60 Pour-Over",
        newsletterSubscribed: true,
        createdAt: new Date().toISOString()
    };

    /**
     * Initialize Supabase client if configured
     */
    function initSupabase() {
        if (window.SIPWISE_CONFIG && window.SIPWISE_CONFIG.isSupabaseConfigured()) {
            if (window.supabase) {
                supabaseClient = window.supabase.createClient(
                    window.SIPWISE_CONFIG.SUPABASE_URL,
                    window.SIPWISE_CONFIG.SUPABASE_ANON_KEY
                );
                console.log("⚡ Sipwise: Connected to live Supabase backend.");
            }
        }
    }

    /**
     * Get Local Sandbox Users
     */
    function getSandboxUsers() {
        try {
            const data = localStorage.getItem(STORAGE_KEY_USERS);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn(e);
        }
        // Seed initial demo user
        const initial = [
            {
                ...defaultDemoUser,
                passwordHash: "password123"
            }
        ];
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initial));
        return initial;
    }

    function saveSandboxUsers(users) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }

    /**
     * Get Current Active Session User
     */
    function getCurrentUser() {
        if (supabaseClient) {
            // In live Supabase mode, cached session is managed by SDK or local storage
            const session = supabaseClient.auth.getSession();
            // sync fallback
        }
        try {
            const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
            if (sessionStr) {
                return JSON.parse(sessionStr);
            }
        } catch (e) {
            console.warn(e);
        }
        return null;
    }

    function setSession(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY_SESSION);
        }
        renderNavbarAuth();
        window.dispatchEvent(new CustomEvent("sipwise:auth-changed", { detail: { user } }));
    }

    /**
     * Auth Methods
     */
    async function signUp({ fullName, email, password, city, favoriteBrew, newsletterSubscribed }) {
        email = email.trim().toLowerCase();
        fullName = fullName.trim();
        city = (city || "Bengaluru").trim();

        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        city: city,
                        favorite_brew: favoriteBrew,
                        newsletter_subscribed: Boolean(newsletterSubscribed)
                    }
                }
            });
            if (error) throw error;
            const user = {
                id: data.user.id,
                email: data.user.email,
                fullName: fullName,
                city: city,
                favoriteBrew: favoriteBrew,
                newsletterSubscribed: Boolean(newsletterSubscribed)
            };
            setSession(user);
            return user;
        }

        // Sandbox Mode
        const users = getSandboxUsers();
        if (users.some((u) => u.email === email)) {
            throw new Error("An account with this email already exists. Try signing in.");
        }

        const newUser = {
            id: "usr_" + Math.random().toString(36).substring(2, 9),
            fullName,
            email,
            passwordHash: password,
            city: city || "Bengaluru",
            favoriteBrew: favoriteBrew || "Pour-Over (V60)",
            newsletterSubscribed: newsletterSubscribed !== undefined ? Boolean(newsletterSubscribed) : true,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveSandboxUsers(users);

        const sessionUser = {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            city: newUser.city,
            favoriteBrew: newUser.favoriteBrew,
            newsletterSubscribed: newUser.newsletterSubscribed
        };
        setSession(sessionUser);
        return sessionUser;
    }

    async function signIn({ email, password }) {
        email = email.trim().toLowerCase();

        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;

            // Fetch profile
            let fullName = data.user.user_metadata?.full_name || "Coffee Lover";
            let city = data.user.user_metadata?.city || "Bengaluru";
            let favoriteBrew = data.user.user_metadata?.favorite_brew || "Pour-Over (V60)";
            let newsletterSubscribed = data.user.user_metadata?.newsletter_subscribed ?? true;

            const user = {
                id: data.user.id,
                email: data.user.email,
                fullName,
                city,
                favoriteBrew,
                newsletterSubscribed
            };
            setSession(user);
            return user;
        }

        // Sandbox Mode
        const users = getSandboxUsers();
        const found = users.find((u) => u.email === email);

        if (!found) {
            throw new Error("No account found with this email address.");
        }
        if (found.passwordHash !== password) {
            throw new Error("Incorrect password. Please verify and try again.");
        }

        const sessionUser = {
            id: found.id,
            fullName: found.fullName,
            email: found.email,
            city: found.city || "Bengaluru",
            favoriteBrew: found.favoriteBrew,
            newsletterSubscribed: found.newsletterSubscribed ?? true
        };
        setSession(sessionUser);
        return sessionUser;
    }

    async function signOut() {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        setSession(null);
    }

    /**
     * Inject Auth Modal if not already present in DOM
     */
    function ensureAuthModal() {
        if (document.getElementById("sipwiseAuthModal")) return;

        const modalHTML = `
        <div id="sipwiseAuthModal" class="sipwise-modal-overlay" aria-hidden="true">
            <div class="sipwise-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalHeading">
                <button type="button" class="modal-close-btn" id="authModalCloseBtn" aria-label="Close modal">✕</button>
                
                <div class="auth-modal-header">
                    <span class="auth-brand-badge">SIPWISE COMMUNITY</span>
                    <h2 id="authModalHeading">Sign in to your coffee journey</h2>
                    <p class="auth-modal-sub">Save single-estate beans & roasters, rate your daily brews, and share tasting impressions.</p>
                </div>

                <div class="auth-tabs-bar" role="tablist">
                    <button type="button" class="auth-tab-btn active" id="authTabSignIn" role="tab" aria-selected="true">Sign In</button>
                    <button type="button" class="auth-tab-btn" id="authTabSignUp" role="tab" aria-selected="false">Create Account</button>
                </div>

                <!-- Alert Message Box -->
                <div id="authAlertBox" class="auth-alert-box" style="display: none;"></div>

                <!-- Sign In Form -->
                <form id="signInForm" class="auth-form-content">
                    <div class="auth-field-group">
                        <label for="signInEmail">Email Address</label>
                        <input type="email" id="signInEmail" required placeholder="name@example.com" autocomplete="email">
                    </div>
                    <div class="auth-field-group">
                        <label for="signInPassword">Password</label>
                        <input type="password" id="signInPassword" required placeholder="••••••••" autocomplete="current-password">
                    </div>

                    <button type="submit" class="auth-submit-btn" id="signInSubmitBtn">Sign In to Sipwise</button>

                    <!-- Quick Demo Autofill Helper -->
                    <div class="demo-account-hint">
                        <span>🧪 Quick Test:</span>
                        <button type="button" id="fillDemoAccountBtn" class="demo-fill-btn">Autofill Demo Account (Aditi)</button>
                    </div>
                </form>

                <!-- Sign Up Form -->
                <form id="signUpForm" class="auth-form-content" style="display: none;">
                    <div class="auth-field-group">
                        <label for="signUpName">Full Name</label>
                        <input type="text" id="signUpName" required placeholder="e.g. Vikram Seth" autocomplete="name">
                    </div>
                    <div class="auth-field-group">
                        <label for="signUpEmail">Email Address</label>
                        <input type="email" id="signUpEmail" required placeholder="name@example.com" autocomplete="email">
                    </div>
                    <div class="auth-field-group">
                        <label for="signUpCity">City / Location</label>
                        <input type="text" id="signUpCity" list="indianCoffeeCities" placeholder="e.g. Bengaluru, Mumbai, Delhi" required>
                        <datalist id="indianCoffeeCities">
                            <option value="Bengaluru">
                            <option value="Mumbai">
                            <option value="Delhi NCR">
                            <option value="Chennai">
                            <option value="Hyderabad">
                            <option value="Pune">
                            <option value="Kolkata">
                            <option value="Chikmagalur">
                            <option value="Coorg">
                            <option value="Goa">
                            <option value="Kochi">
                            <option value="Jaipur">
                        </datalist>
                    </div>
                    <div class="auth-field-group">
                        <label for="signUpPassword">Password (6+ characters)</label>
                        <input type="password" id="signUpPassword" minlength="6" required placeholder="Create a password" autocomplete="new-password">
                    </div>
                    <div class="auth-field-group">
                        <label for="signUpBrew">Favorite Brewing Method</label>
                        <select id="signUpBrew">
                            <option value="Hario V60 Pour-Over">Hario V60 Pour-Over</option>
                            <option value="South Indian Filter">South Indian Filter</option>
                            <option value="AeroPress">AeroPress</option>
                            <option value="French Press">French Press</option>
                            <option value="Moka Pot">Moka Pot</option>
                            <option value="Cold Brew">Cold Brew</option>
                            <option value="Espresso">Espresso</option>
                        </select>
                    </div>
                    <div class="auth-checkbox-group">
                        <label class="checkbox-label" for="signUpNewsletter">
                            <input type="checkbox" id="signUpNewsletter" checked>
                            <span>Receive monthly Sipwise dispatch (curated micro-lot drops & brewing guides)</span>
                        </label>
                    </div>

                    <button type="submit" class="auth-submit-btn" id="signUpSubmitBtn">Create Free Account</button>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
        bindModalEvents();
    }

    function bindModalEvents() {
        const modal = document.getElementById("sipwiseAuthModal");
        const closeBtn = document.getElementById("authModalCloseBtn");
        const tabSignIn = document.getElementById("authTabSignIn");
        const tabSignUp = document.getElementById("authTabSignUp");
        const formSignIn = document.getElementById("signInForm");
        const formSignUp = document.getElementById("signUpForm");
        const heading = document.getElementById("authModalHeading");
        const alertBox = document.getElementById("authAlertBox");
        const demoFillBtn = document.getElementById("fillDemoAccountBtn");

        function showTab(isSignIn) {
            tabSignIn.classList.toggle("active", isSignIn);
            tabSignUp.classList.toggle("active", !isSignIn);
            formSignIn.style.display = isSignIn ? "flex" : "none";
            formSignUp.style.display = isSignIn ? "none" : "flex";
            heading.textContent = isSignIn ? "Sign in to your coffee journey" : "Join the Sipwise coffee community";
            if (alertBox) {
                alertBox.style.display = "none";
                alertBox.textContent = "";
            }
        }

        tabSignIn.addEventListener("click", () => showTab(true));
        tabSignUp.addEventListener("click", () => showTab(false));

        closeBtn.addEventListener("click", closeAuthModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeAuthModal();
        });

        // Demo autofill
        if (demoFillBtn) {
            demoFillBtn.addEventListener("click", () => {
                document.getElementById("signInEmail").value = "aditi@sipwise.coffee";
                document.getElementById("signInPassword").value = "password123";
            });
        }

        // Sign in submit
        formSignIn.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("signInEmail").value;
            const password = document.getElementById("signInPassword").value;
            const btn = document.getElementById("signInSubmitBtn");

            btn.disabled = true;
            btn.textContent = "Signing In...";
            alertBox.style.display = "none";

            try {
                const user = await signIn({ email, password });
                closeAuthModal();
                if (typeof authSuccessCallback === "function") {
                    authSuccessCallback(user);
                    authSuccessCallback = null;
                }
            } catch (err) {
                alertBox.textContent = err.message || "Failed to sign in. Please try again.";
                alertBox.className = "auth-alert-box error";
                alertBox.style.display = "block";
            } finally {
                btn.disabled = false;
                btn.textContent = "Sign In to Sipwise";
            }
        });

        // Sign up submit
        formSignUp.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fullName = document.getElementById("signUpName").value;
            const email = document.getElementById("signUpEmail").value;
            const city = document.getElementById("signUpCity").value;
            const password = document.getElementById("signUpPassword").value;
            const favoriteBrew = document.getElementById("signUpBrew").value;
            const newsletterSubscribed = document.getElementById("signUpNewsletter").checked;
            const btn = document.getElementById("signUpSubmitBtn");

            btn.disabled = true;
            btn.textContent = "Creating Account...";
            alertBox.style.display = "none";

            try {
                const user = await signUp({
                    fullName,
                    email,
                    city,
                    password,
                    favoriteBrew,
                    newsletterSubscribed
                });
                closeAuthModal();
                if (typeof authSuccessCallback === "function") {
                    authSuccessCallback(user);
                    authSuccessCallback = null;
                }
            } catch (err) {
                alertBox.textContent = err.message || "Failed to create account. Please try again.";
                alertBox.className = "auth-alert-box error";
                alertBox.style.display = "block";
            } finally {
                btn.disabled = false;
                btn.textContent = "Create Free Account";
            }
        });
    }

    function openAuthModal(initialTab = "signin", onSuccess = null) {
        ensureAuthModal();
        authSuccessCallback = onSuccess;

        const modal = document.getElementById("sipwiseAuthModal");
        const tabSignIn = document.getElementById("authTabSignIn");
        const tabSignUp = document.getElementById("authTabSignUp");

        if (initialTab === "signup") {
            tabSignUp.click();
        } else {
            tabSignIn.click();
        }

        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeAuthModal() {
        const modal = document.getElementById("sipwiseAuthModal");
        if (modal) {
            modal.classList.remove("is-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    }

    /**
     * Render the Navbar Auth widget
     */
    function renderNavbarAuth() {
        const containers = document.querySelectorAll(".nav-auth-container");
        const currentUser = getCurrentUser();

        containers.forEach((container) => {
            if (currentUser) {
                // User is authenticated
                const initials = currentUser.fullName
                    ? currentUser.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                    : "☕";

                const firstName = currentUser.fullName ? currentUser.fullName.split(" ")[0] : "Account";

                container.innerHTML = `
                    <div class="user-menu-wrapper">
                        <button type="button" class="user-profile-pill" id="userMenuBtn" aria-expanded="false" aria-haspopup="true">
                            <span class="user-avatar-badge">${initials}</span>
                            <span class="user-name-label">${firstName}</span>
                            <span class="menu-carret">▾</span>
                        </button>
                        <div class="user-dropdown-menu" id="userDropdownMenu" role="menu">
                            <div class="user-dropdown-header">
                                <div class="drop-user-name">${currentUser.fullName}</div>
                                <div class="drop-user-email">${currentUser.email}</div>
                                <div class="drop-user-meta-line">
                                    <span class="drop-user-city">📍 ${currentUser.city || "Bengaluru"}</span>
                                    <span class="drop-user-brew">☕ ${currentUser.favoriteBrew}</span>
                                </div>
                                <div class="drop-user-newsletter">
                                    ${currentUser.newsletterSubscribed ? "📬 Monthly Dispatch: Subscribed" : "📭 Monthly Dispatch: Off"}
                                </div>
                            </div>
                            <div class="user-dropdown-divider"></div>
                            <button type="button" class="drop-menu-item" id="openShelfFromMenuBtn">
                                <span>♡ My Saved Shelf</span>
                                <span class="shelf-count-badge" id="dropdownShelfBadge">0</span>
                            </button>
                            <div class="user-dropdown-divider"></div>
                            <button type="button" class="drop-menu-item sign-out-item" id="authSignOutBtn">
                                <span>🚪 Sign Out</span>
                            </button>
                        </div>
                    </div>
                `;

                const menuBtn = container.querySelector("#userMenuBtn");
                const dropdown = container.querySelector("#userDropdownMenu");
                const signOutBtn = container.querySelector("#authSignOutBtn");
                const shelfBtn = container.querySelector("#openShelfFromMenuBtn");

                if (menuBtn && dropdown) {
                    menuBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
                        menuBtn.setAttribute("aria-expanded", !isExpanded);
                        dropdown.classList.toggle("is-open", !isExpanded);
                    });

                    document.addEventListener("click", () => {
                        menuBtn.setAttribute("aria-expanded", "false");
                        dropdown.classList.remove("is-open");
                    });
                }

                if (signOutBtn) {
                    signOutBtn.addEventListener("click", () => {
                        signOut();
                    });
                }

                if (shelfBtn) {
                    shelfBtn.addEventListener("click", () => {
                        if (window.SipwiseBookmarks && window.SipwiseBookmarks.openShelfDrawer) {
                            window.SipwiseBookmarks.openShelfDrawer();
                        }
                    });
                }
            } else {
                // Guest / Not logged in
                container.innerHTML = `
                    <button type="button" class="nav-signin-btn" id="navSignInBtn">
                        Sign In / Join
                    </button>
                `;
                const btn = container.querySelector("#navSignInBtn");
                if (btn) {
                    btn.addEventListener("click", () => {
                        openAuthModal("signin");
                    });
                }
            }
        });

        // Update bookmarks counter badge if available
        if (window.SipwiseBookmarks && window.SipwiseBookmarks.updateBadges) {
            window.SipwiseBookmarks.updateBadges();
        }
    }

    // Public API
    window.SipwiseAuth = {
        getCurrentUser,
        signUp,
        signIn,
        signOut,
        openAuthModal,
        closeAuthModal,
        renderNavbarAuth
    };

    // Auto-init on DOMContentLoaded
    document.addEventListener("DOMContentLoaded", () => {
        initSupabase();
        renderNavbarAuth();
    });
})();
