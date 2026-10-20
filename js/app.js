/**
 * Sipwise — Indian Specialty Coffee Directory
 *
 * Concepts covered:
 * 1. Data representation using an Array of Objects with nested arrays.
 * 2. DOM element selection and dynamic rendering.
 * 3. Modal / Drawer component with accessibility (Escape key, backdrop dismiss, scroll lock).
 * 4. Multi-criteria filtering combining Search Input + Quick Filter Chips.
 */

// 1. Data Store: Real Indian Specialty Coffee Roasters with Estate & Gear details
const roasters = [
    {
        id: "maverick-and-farmer",
        name: "Maverick & Farmer Coffee Roasters",
        location: "Ulsoor, Bengaluru (Bangalore)",
        founded: "2018",
        description: "Pioneering farm-to-cup roasters with their own experimental estate in Pollibetta, Coorg, famous for cold smokes, lactic fermentations, and innovative brews.",
        story: "Founded by Ashish D'abreo and Tej Thaker, Maverick & Farmer operates from their own generational estate in Coorg. They run India's most experimental post-harvest processing lab, introducing bio-reactors, cold-smoking, and cultured yeast ferments to push Indian coffee beyond traditional profiles.",
        website: "https://www.maverickandfarmer.com",
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
        specialty: "Experimental Fermentations",
        estates: [
            "Pollibetta Estate (Coorg, Karnataka)",
            "Friendship Estate (Shevaroy Hills, Tamil Nadu)",
            "Kerehaklu Estate (Aldur, Karnataka)"
        ],
        signatureBeans: [
            "Parama (World's First Cold-Smoked Coffee)",
            "Ol' Smoky (Cold Smoked Arabica)",
            "Orange Rosemary Yeast Fermentation Lot",
            "Kalledevarapura Pulp Sun-Dried"
        ],
        recommendedGear: [
            "V60 Pour-Over",
            "AeroPress",
            "Cold Brew Dripper",
            "French Press"
        ]
    },
    {
        id: "blue-tokai",
        name: "Blue Tokai Coffee Roasters",
        location: "Bengaluru (Bangalore) & Pan-India",
        founded: "2013",
        description: "Pioneers of India's third-wave coffee movement with landmark roasteries across Indiranagar & Koramangala, sourcing directly from award-winning Karnataka estates.",
        story: "Matt Chitharanjan and Namrata Asthana started Blue Tokai in 2013 to bridge the gap between Indian coffee growers and domestic consumers. Roasting on customized Probat machines, they provide transparency down to the lot level and roast fresh on demand.",
        website: "https://bluetokaicoffee.com",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        specialty: "Single Origin & Microlots",
        estates: [
            "Attikan Estate (Biligirirangana Hills, Karnataka)",
            "Kalledevarapura Estate (Chikmagalur, Karnataka)",
            "Riverdale Estate (Shevaroy Hills, Tamil Nadu)",
            "MS Estate (Kallacool, Tamil Nadu)"
        ],
        signatureBeans: [
            "Attikan Estate (Dark Roast — Fig & Chocolate)",
            "Silver Oak Blend (Medium Roast — Hazelnut & Honey)",
            "Riverdale Estate N72 (Yeast Fermentation)",
            "Vienna Roast (Rich & Caramelized)"
        ],
        recommendedGear: [
            "South Indian Filter",
            "French Press",
            "V60 Pour-Over",
            "Espresso Machine"
        ]
    },
    {
        id: "subko",
        name: "Subko Specialty Coffee & Bakehouse",
        location: "Indiranagar, Bengaluru (Bangalore) & Mumbai",
        founded: "2020",
        description: "Hyper-focused on South Asian provenance, featuring a flagship craft roastery in Indiranagar celebrating rare regional micro-lots and artisan baking.",
        story: "Founded by Rahul Reddy, Subko celebrates hyper-traceable South Asian provenance. Working directly with micro-lot farmers across Karnataka, Tamil Nadu, and Meghalaya, they unite specialty coffee roasting, bean-to-bar craft cacao, and sourdough viennoiserie.",
        website: "https://www.subko.coffee",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        specialty: "South Asian Micro-lots",
        estates: [
            "Tat Tvam Asi Organic Estate (Baba Budangiri, Karnataka)",
            "Harley Estate (Sakleshpur, Karnataka)",
            "Kerehaklu Estate (Chikmagalur, Karnataka)",
            "Gowri Estate (Yercaud, Tamil Nadu)"
        ],
        signatureBeans: [
            "Project Sankalp Reserve Lots",
            "Tat Tvam Asi Anaerobic Naturals",
            "Subko House Blend (Bandra Roast)",
            "Kerehaklu Honey Lot"
        ],
        recommendedGear: [
            "Kalita Wave",
            "AeroPress",
            "Espresso Machine",
            "Clever Dripper"
        ]
    },
    {
        id: "araku",
        name: "Araku Coffee",
        location: "Indiranagar, Bengaluru (Bangalore) & Araku Valley",
        founded: "2008",
        description: "Globally acclaimed, 100% organic and biodynamic specialty coffee grown by indigenous tribal farmers, with an iconic sensory cafe in Indiranagar.",
        story: "Araku is a regenerative agriculture enterprise empowering over 100,000 adivasi indigenous farmers in Andhra Pradesh. Cultivated under biodynamic tree canopies, their coffee was awarded the Epicures Gold Medal in Paris and is served in top Michelin-starred restaurants across Europe.",
        website: "https://www.arakucoffee.in",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        specialty: "Biodynamic Arabica",
        estates: [
            "Araku Highlands (Eastern Ghats, Andhra Pradesh)",
            "Tribal Agroforestry Biodynamic Lots"
        ],
        signatureBeans: [
            "Signature (Medium Roast — Citrus & Cacao)",
            "Grand Reserve (Hand-selected Microlot)",
            "Selection (Creamy & Well-balanced Arabica)",
            "Microclimate Lots (Seasonal Single Lot)"
        ],
        recommendedGear: [
            "Chemex",
            "V60 Dripper",
            "Moka Pot",
            "AeroPress"
        ]
    },
    {
        id: "third-wave",
        name: "Third Wave Coffee Roasters",
        location: "Koramangala, Bengaluru (Bangalore)",
        founded: "2016",
        description: "Born in Bengaluru's cafe district, dedicated to specialty single-estate Arabicas, precision roasting, and handcrafted pour-overs.",
        story: "Started in Koramangala in 2016 by Ayush Bathwal, Anirudh Sharma, and Sushant Goel, Third Wave ignited the modern specialty cafe scene across Indian metros. They roast small batches on Diedrich and Giesen roasters to highlight the sweetness of estate-specific Arabicas.",
        website: "https://www.thirdwavecoffee.in",
        image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
        specialty: "Single-Estate Arabica",
        estates: [
            "Baarbara Estate (Chikmagalur, Karnataka)",
            "Elkhill Estate (Coorg, Karnataka)",
            "Bettadakhan Estate (Chikmagalur, Karnataka)"
        ],
        signatureBeans: [
            "Baarbara Berry (Fully Washed Arabica)",
            "Deo's Mountain Dark Roast",
            "Monsooned Malabar AA Superb",
            "Third Wave Special House Blend"
        ],
        recommendedGear: [
            "French Press",
            "V60 Pour-Over",
            "Espresso Machine",
            "Syphon"
        ]
    },
    {
        id: "kc-roasters",
        name: "KC Roasters (Koinonia)",
        location: "Mumbai, Maharashtra",
        founded: "2017",
        description: "Artisanal small-batch roastery tucked away in Chuim Village, crafting clean, nuanced roasts with Japanese roasting craftsmanship.",
        story: "Shannon D'Souza established KC Roasters with a purist approach: small batch size, meticulous cupping protocols, and honoring the legacy of multi-generational Indian planters. Their Bandra roastery is renowned for nuanced light-to-medium profiles.",
        website: "https://kcroasters.com",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
        specialty: "Small-Batch Roasts",
        estates: [
            "Kelagur Estate (Chikmagalur, Karnataka)",
            "Marvahulla Estate (Nilgiris, Tamil Nadu)",
            "Balanoor Estate (Chikmagalur, Karnataka)"
        ],
        signatureBeans: [
            "Kelagur Washed (Stone Fruit & Caramel)",
            "Marvahulla Honey Sun-Dried",
            "Doraikanal Estate Dark Roast",
            "Koinonia Signature Blend"
        ],
        recommendedGear: [
            "V60 Dripper",
            "Chemex",
            "AeroPress",
            "French Press"
        ]
    },
    {
        id: "corridor-seven",
        name: "Corridor Seven Coffee Roasters",
        location: "Nagpur, Maharashtra",
        founded: "2017",
        description: "Community-driven roasters committed to ethical sourcing, farmer relationships, and demystifying manual brewing for everyday coffee lovers.",
        story: "Founded by Mithilesh Vazalwar (India's first representative at the World Aeropress Championship), Corridor Seven bypasses middlemen to ensure 100% of their green beans come from direct relationships with growers, championing coffee education across central India.",
        website: "https://corridorseven.coffee",
        image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80",
        specialty: "Direct Trade Lots",
        estates: [
            "Riverdale Estate (Yercaud, Shevaroys)",
            "Gowri Estate (Shevaroy Hills, Tamil Nadu)",
            "Badra Estate (Chikmagalur, Karnataka)"
        ],
        signatureBeans: [
            "Riverdale N72 Yeast Ferment",
            "Orange Pulp Sun-Dried Arabica",
            "August Blend (Rich Dark Roast)",
            "Seven Hills Espresso Roast"
        ],
        recommendedGear: [
            "AeroPress",
            "Clever Dripper",
            "South Indian Filter",
            "Moka Pot"
        ]
    },
    {
        id: "bloom-coffee",
        name: "Bloom Coffee Roasters",
        location: "Chandigarh / Pan-India",
        founded: "2019",
        description: "Focused on highlighting terroir and experimental fermentation lots from premier estates across Chikmagalur and Shevaroys.",
        story: "Bloom Coffee Roasters operates with precision micro-roasting, emphasizing high-altitude specialty lots and natural processing experiments. They spotlight the forward-thinking techniques of young planters who are pushing the boundaries of Indian specialty.",
        website: "https://bloomcoffeeroasters.in",
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
        specialty: "Experimental Lots",
        estates: [
            "Ratnagiri Estate (Bababudangiri, Karnataka)",
            "Mooleh Manay Estate (Coorg, Karnataka)",
            "Kerehaklu Estate (Aldur, Karnataka)"
        ],
        signatureBeans: [
            "Ratnagiri Carbonic Maceration Lot",
            "Mooleh Manay Yeast Maceration",
            "Bloom Special Espresso Blend",
            "Silver Clouds Washed Lot"
        ],
        recommendedGear: [
            "V60 Pour-Over",
            "AeroPress",
            "Espresso Machine",
            "French Press"
        ]
    }
];

// 2. State & DOM Elements
let activeFilter = "all";

const roastersGrid = document.getElementById("roastersGrid");
const searchInput = document.getElementById("searchInput");
const roasterCount = document.getElementById("roasterCount");
const noResults = document.getElementById("noResults");
const resetSearchBtn = document.getElementById("resetSearchBtn");
const filterChips = document.querySelectorAll(".filter-chips .chip");

// Drawer elements
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");
const drawerContent = document.getElementById("drawerContent");

/**
 * 3. Render function: Generates an HTML card for a single roaster
 * Clicking anywhere on the card opens the rich slide-over drawer
 * @param {Object} roaster - A roaster object from our dataset
 * @returns {string} HTML string representing the card
 */
function createRoasterCardHTML(roaster) {
    return `
        <article class="roaster-card" data-id="${roaster.id}" tabindex="0" role="button" aria-label="View details for ${roaster.name}">
            <div class="roaster-card-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="roaster-card-location">${roaster.location}</span>
                    <button type="button" class="btn-bookmark" data-type="roaster" data-id="${roaster.id}" data-title="${roaster.name}" data-subtitle="${roaster.location}" title="Save roaster">
                        <span class="heart-icon">♡</span> <span class="btn-label">Save</span>
                    </button>
                </div>
                <h3 class="roaster-card-title">${roaster.name}</h3>
                <p class="roaster-card-description">${roaster.description}</p>
                <div class="roaster-card-footer">
                    <span class="roaster-card-tag">${roaster.specialty}</span>
                    <span class="roaster-card-link-text">
                        Explore details →
                    </span>
                </div>
            </div>
            <div class="roaster-card-image-link">
                <div class="roaster-card-image">
                    <img src="${roaster.image}" alt="${roaster.name}" loading="lazy">
                </div>
            </div>
        </article>
    `;
}

/**
 * 4. Main display function: Renders a list of roasters to the grid
 * @param {Array} list - Array of roaster objects to display
 */
function renderRoasters(list) {
    // If no roasters match the query, display the empty state
    if (list.length === 0) {
        roastersGrid.innerHTML = "";
        noResults.classList.remove("hidden");
        roasterCount.textContent = "0 roasters found";
        return;
    }

    // Hide the empty state if results are found
    noResults.classList.add("hidden");

    // Use .map() to convert each roaster object into an HTML string,
    // then .join('') to combine them into one continuous string
    roastersGrid.innerHTML = list.map(createRoasterCardHTML).join("");

    // Update the results counter
    roasterCount.textContent = `Showing ${list.length} of ${roasters.length} roasters`;

    // Attach card click handlers for the slide-over drawer
    attachCardListeners();

    // Bind card bookmark buttons
    if (window.SipwiseBookmarks) {
        window.SipwiseBookmarks.bindButtons();
    }
}

/**
 * 5. Slide-Over Detail Drawer: Opens drawer with rich details
 * @param {string} roasterId - The unique ID of the clicked roaster
 */
function openDrawer(roasterId) {
    const roaster = roasters.find((r) => r.id === roasterId);
    if (!roaster) return;

    // Generate Estates pills
    const estatesHTML = roaster.estates
        ? roaster.estates.map((estate) => `<span class="estate-pill">🌱 ${estate}</span>`).join("")
        : "<span class=\"estate-pill\">Direct Farmer Partnerships</span>";

    // Generate Signature Beans list
    const beansHTML = roaster.signatureBeans
        ? roaster.signatureBeans.map((bean) => `
            <div class="bean-item">
                <span class="bean-item-icon">☕</span>
                <span>${bean}</span>
            </div>
        `).join("")
        : "";

    // Anchor map connecting equipment to brew-guide.html
    const gearAnchorMap = {
        "V60 Pour-Over": "brew-guide.html#v60",
        "V60 Dripper": "brew-guide.html#v60",
        "AeroPress": "brew-guide.html#aeropress",
        "South Indian Filter": "brew-guide.html#south-indian-filter",
        "French Press": "brew-guide.html#french-press",
        "Moka Pot": "brew-guide.html#moka-pot",
        "Cold Brew Dripper": "brew-guide.html#cold-brew",
        "Cold Brew": "brew-guide.html#cold-brew",
        "Kalita Wave": "brew-guide.html#v60",
        "Chemex": "brew-guide.html#v60",
        "Clever Dripper": "brew-guide.html#aeropress",
        "Espresso Machine": "brew-guide.html#moka-pot",
        "Syphon": "brew-guide.html#v60"
    };

    // Generate Recommended Brewing Gear pills (linked to brewing guide)
    const gearHTML = roaster.recommendedGear
        ? roaster.recommendedGear.map((gear) => {
            const link = gearAnchorMap[gear] || "brew-guide.html";
            return `<a href="${link}" class="gear-pill" title="Learn recipe & steps for ${gear}">${gear} ↗</a>`;
        }).join("")
        : "";

    drawerContent.innerHTML = `
        <div class="drawer-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div>
                <span class="roaster-card-location">${roaster.location}</span>
                <h2 class="drawer-title" id="drawerTitle">${roaster.name}</h2>
            </div>
            <button type="button" class="btn-bookmark" data-type="roaster" data-id="${roaster.id}" data-title="${roaster.name}" data-subtitle="${roaster.location}" title="Save to shelf">
                <span class="heart-icon">♡</span> <span class="btn-label">Save</span>
            </button>
        </div>

        <div class="drawer-image">
            <img src="${roaster.image}" alt="${roaster.name}">
        </div>

        <div class="drawer-stat-grid">
            <div class="stat-item">
                <span>ESTABLISHED</span>
                <span>${roaster.founded || "Artisanal"}</span>
            </div>
            <div class="stat-item">
                <span>SPECIALTY FOCUS</span>
                <span>${roaster.specialty}</span>
            </div>
        </div>

        <div class="drawer-section">
            <h4>📖 Roastery Story</h4>
            <p>${roaster.story || roaster.description}</p>
        </div>

        <div class="drawer-section">
            <h4>🌿 Estate Origins & Terroir</h4>
            <div class="estate-pills">
                ${estatesHTML}
            </div>
        </div>

        <div class="drawer-section">
            <h4>✨ Signature Beans to Try</h4>
            <div class="beans-list">
                ${beansHTML}
            </div>
        </div>

        <div class="drawer-section">
            <h4>⚙️ Recommended Brewing Gear</h4>
            <div class="gear-pills">
                ${gearHTML}
            </div>
        </div>

        <a href="${roaster.website}" target="_blank" rel="noopener noreferrer" class="drawer-cta-btn">
            Shop beans on official website ↗
        </a>

        <!-- Community Reviews & Ratings -->
        <div class="drawer-reviews-container" id="roasterReviewsWrap"></div>
    `;

    // Render community reviews for this roaster
    if (window.SipwiseReviews) {
        const revWrap = drawerContent.querySelector("#roasterReviewsWrap");
        window.SipwiseReviews.renderReviewSection(revWrap, "roaster", roaster.id, roaster.name);
    }

    // Bind bookmark buttons inside the drawer
    if (window.SipwiseBookmarks) {
        window.SipwiseBookmarks.bindButtons();
    }

    // Open overlay and lock body scroll
    drawerOverlay.classList.add("active");
    drawerOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

/**
 * Closes the slide-over drawer
 */
function closeDrawer() {
    drawerOverlay.classList.remove("active");
    drawerOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/**
 * Attaches click and keyboard listeners to cards
 */
function attachCardListeners() {
    const cards = roastersGrid.querySelectorAll(".roaster-card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const roasterId = card.dataset.id;
            openDrawer(roasterId);
        });

        // Accessibility: allow pressing Enter or Space to open
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDrawer(card.dataset.id);
            }
        });
    });
}

/**
 * 6. Combined Search & Category Filter Handler
 * Evaluates both the active category chip and the search input query
 */
function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const isBangaloreSearch = query.includes("bangalore") || query.includes("bengaluru");

    const filteredRoasters = roasters.filter((roaster) => {
        const name = roaster.name.toLowerCase();
        const location = roaster.location.toLowerCase();
        const specialty = roaster.specialty.toLowerCase();
        const description = roaster.description.toLowerCase();

        // 1. Evaluate Quick Filter Chip
        let matchesChip = true;
        if (activeFilter === "bengaluru") {
            matchesChip = location.includes("bengaluru") || location.includes("bangalore");
        } else if (activeFilter === "mumbai") {
            matchesChip = location.includes("mumbai");
        } else if (activeFilter === "experimental") {
            matchesChip = specialty.includes("experimental") || description.includes("fermentation");
        } else if (activeFilter === "single-origin") {
            matchesChip = specialty.includes("single") || specialty.includes("microlot") || description.includes("single-estate");
        } else if (activeFilter === "organic") {
            matchesChip = specialty.includes("biodynamic") || description.includes("organic");
        }

        // 2. Evaluate Search Box Query
        let matchesQuery = true;
        if (query) {
            const matchesText = name.includes(query) || location.includes(query) || specialty.includes(query);
            const matchesCityAlias = isBangaloreSearch && (location.includes("bangalore") || location.includes("bengaluru"));
            matchesQuery = matchesText || matchesCityAlias;
        }

        return matchesChip && matchesQuery;
    });

    renderRoasters(filteredRoasters);
}

// 7. Global Event Listeners
// Real-time search input
searchInput.addEventListener("input", applyFilters);

// Quick Filter Chips click handling
filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        // Toggle active visual state
        filterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");

        // Set active category and re-filter
        activeFilter = chip.dataset.filter;
        applyFilters();
    });
});

// Reset search button inside the empty state
if (resetSearchBtn) {
    resetSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        activeFilter = "all";
        filterChips.forEach((c) => {
            if (c.dataset.filter === "all") c.classList.add("active");
            else c.classList.remove("active");
        });
        searchInput.focus();
        applyFilters();
    });
}

// Drawer close button click
drawerCloseBtn.addEventListener("click", closeDrawer);

// Dismiss drawer when clicking outside (on backdrop)
drawerOverlay.addEventListener("click", (e) => {
    if (e.target === drawerOverlay) {
        closeDrawer();
    }
});

// Dismiss drawer on Escape key press
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawerOverlay.classList.contains("active")) {
        closeDrawer();
    }
});

// 8. Initial render when the page loads
renderRoasters(roasters);
