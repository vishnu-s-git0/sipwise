/**
 * Sipwise — Indian Specialty Coffee Beans Catalog & Taste Matcher
 *
 * Concepts covered:
 * 1. Data-driven bean catalog with origin, roast, process, and sensory notes.
 * 2. Multi-step interactive Taste Matcher wizard (Method + Flavor + Milk).
 * 3. Compound filtering (Search + Category Filter + Taste Matcher).
 * 4. Responsive 2-per-row grid rendering with dynamic state feedback.
 */

// 1. Data Store: Premier Indian Specialty Coffee Harvests
const beans = [
    {
        id: "attikan-estate",
        name: "Attikan Estate Washed Arabica",
        roaster: "Blue Tokai Coffee Roasters",
        roasterUrl: "https://bluetokaicoffee.com",
        estate: "Attikan Estate, Biligirirangana (BR) Hills",
        region: "Karnataka",
        altitude: "1,650m",
        varietal: "S795 & SLN 9",
        process: "Washed",
        roast: "Dark",
        flavors: ["Dark Chocolate", "Dried Fig", "Roasted Almond"],
        brewMethods: ["south-indian-filter", "french-press", "moka-pot"],
        flavorCategory: "chocolate",
        milkFriendly: true,
        description: "Grown at dramatic elevations in a wild elephant corridor, Attikan produces a dense bean with profound chocolate depth, low acidity, and a luxurious heavy finish.",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://bluetokaicoffee.com/products/attikan-estate"
    },
    {
        id: "project-sankalp",
        name: "Project Sankalp Reserve Lot",
        roaster: "Subko Specialty Coffee",
        roasterUrl: "https://www.subko.coffee",
        estate: "Kerehaklu Estate, Aldur",
        region: "Chikmagalur, Karnataka",
        altitude: "1,200m",
        varietal: "Red Catuai & Chandragiri",
        process: "Experimental",
        roast: "Light",
        flavors: ["Passion Fruit", "Wild Honey", "Guava"],
        brewMethods: ["v60", "aeropress", "cold-brew"],
        flavorCategory: "fruity",
        milkFriendly: false,
        description: "An extraordinary anaerobic natural lot from 5th-generation planter Pranoy Thipaiah, featuring wild tropical aromatics and champagne-like acidity.",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://www.subko.coffee"
    },
    {
        id: "parama-cold-smoke",
        name: "Parama Cold-Smoked Arabica",
        roaster: "Maverick & Farmer",
        roasterUrl: "https://www.maverickandfarmer.com",
        estate: "Pollibetta Estate, Kodagu",
        region: "Coorg, Karnataka",
        altitude: "1,100m",
        varietal: "S795 Arabica",
        process: "Experimental",
        roast: "Medium",
        flavors: ["Hickory Woodsmoke", "Dark Caramel", "Clove"],
        brewMethods: ["aeropress", "french-press", "cold-brew"],
        flavorCategory: "spiced",
        milkFriendly: true,
        description: "The world's first cold-smoked coffee. Unroasted green beans are exposed to artisanal hickory and fruitwood smoke before roasting, yielding an unforgettable campfire sweetness.",
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://www.maverickandfarmer.com"
    },
    {
        id: "araku-grand-reserve",
        name: "Araku Grand Reserve Organic",
        roaster: "Araku Coffee",
        roasterUrl: "https://www.arakucoffee.in",
        estate: "Araku Highlands Agroforestry Lots",
        region: "Eastern Ghats, Andhra Pradesh",
        altitude: "1,150m",
        varietal: "Pure Arabica Heirloom",
        process: "Washed",
        roast: "Medium",
        flavors: ["Red Apple", "Brown Sugar", "Dark Cocoa"],
        brewMethods: ["v60", "aeropress", "moka-pot"],
        flavorCategory: "chocolate",
        milkFriendly: true,
        description: "Cultivated biodynamically under dense fruit and silver oak canopies by adivasi tribal farmers. Crisp malic acidity balanced by buttery caramel sweetness.",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://www.arakucoffee.in"
    },
    {
        id: "riverdale-yeast",
        name: "Riverdale N72 Yeast Maceration",
        roaster: "Corridor Seven Coffee Roasters",
        roasterUrl: "https://corridorseven.coffee",
        estate: "Riverdale Estate, Yercaud",
        region: "Shevaroy Hills, Tamil Nadu",
        altitude: "1,500m",
        varietal: "Selection 9 (SLN 9)",
        process: "Experimental",
        roast: "Light",
        flavors: ["Pineapple", "Winey Plum", "Floral Jasmine"],
        brewMethods: ["v60", "aeropress", "cold-brew"],
        flavorCategory: "floral",
        milkFriendly: false,
        description: "From forward-thinking planter Prakashan Balaraman, this lot uses custom wine-yeast inoculation in stainless fermentation tanks to produce high-clarity floral elegance.",
        image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://corridorseven.coffee"
    },
    {
        id: "baarbara-berry",
        name: "Baarbara Berry Fully Washed",
        roaster: "Third Wave Coffee",
        roasterUrl: "https://www.thirdwavecoffee.in",
        estate: "Baarbara Estate, Baba Budan Range",
        region: "Chikmagalur, Karnataka",
        altitude: "1,400m",
        varietal: "S795 & Kaveri",
        process: "Washed",
        roast: "Medium",
        flavors: ["Blueberry", "Citrus Zest", "Black Tea"],
        brewMethods: ["v60", "aeropress"],
        flavorCategory: "fruity",
        milkFriendly: false,
        description: "Nestled in the historical birthplace of Indian coffee, Baarbara Estate produces a tea-like delicacy, bursting with summer berries and bright bergamot.",
        image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://www.thirdwavecoffee.in"
    },
    {
        id: "kelagur-washed",
        name: "Kelagur Estate Single Origin",
        roaster: "KC Roasters (Koinonia)",
        roasterUrl: "https://kcroasters.com",
        estate: "Kelagur Math Estate, Aldur",
        region: "Chikmagalur, Karnataka",
        altitude: "1,250m",
        varietal: "SLN 795 Arabica",
        process: "Washed",
        roast: "Medium",
        flavors: ["Caramel", "Peach", "Macadamia Nut"],
        brewMethods: ["french-press", "v60", "moka-pot"],
        flavorCategory: "chocolate",
        milkFriendly: true,
        description: "A heritage family estate active since 1927. Roasted cleanly on Japanese craft profiles to highlight silky stone fruit and creamy praline.",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://kcroasters.com"
    },
    {
        id: "ratnagiri-carbonic",
        name: "Ratnagiri Carbonic Maceration Lot",
        roaster: "Bloom Coffee Roasters",
        roasterUrl: "https://bloomcoffeeroasters.in",
        estate: "Ratnagiri Estate (Pearl Mountain)",
        region: "Bababudangiri, Karnataka",
        altitude: "1,450m",
        varietal: "Catuai & Chandragiri",
        process: "Experimental",
        roast: "Light",
        flavors: ["Raspberry", "Grape Soda", "Lavender"],
        brewMethods: ["v60", "aeropress"],
        flavorCategory: "fruity",
        milkFriendly: false,
        description: "From legendary farmer Ashok Patre, this lot is sealed in CO2-flushed pressurized bio-reactors, creating candy-like sweetness and a fragrant floral bouquet.",
        image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://bloomcoffeeroasters.in"
    },
    {
        id: "monsooned-malabar",
        name: "Monsooned Malabar Superb AA",
        roaster: "Blue Tokai Coffee Roasters",
        roasterUrl: "https://bluetokaicoffee.com",
        estate: "Malabar Coastal Monsoon Yards",
        region: "Western Ghats, Kerala & Karnataka",
        altitude: "950m",
        varietal: "Indigenous Arabica & Robusta",
        process: "Monsooned",
        roast: "Dark",
        flavors: ["Bakers Chocolate", "Malt", "Earthy Spice"],
        brewMethods: ["south-indian-filter", "french-press", "moka-pot"],
        flavorCategory: "spiced",
        milkFriendly: true,
        description: "India's legendary geographic indicator (GI) coffee. Beans are spread across coastal open-sided curing sheds to absorb humid Arabian Sea monsoon winds for months, reducing all acidity into a dense, creamy, velvety brew.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        shopUrl: "https://bluetokaicoffee.com"
    }
];

// 2. State & DOM References
let activeFilter = "all";
let tastePreferences = {
    method: "all",
    flavor: "all",
    milk: "all"
};

const beansGrid = document.getElementById("beansGrid");
const beanSearchInput = document.getElementById("beanSearchInput");
const beanCount = document.getElementById("beanCount");
const noBeanResults = document.getElementById("noBeanResults");
const resetBeanSearchBtn = document.getElementById("resetBeanSearchBtn");
const beanFilterChips = document.querySelectorAll(".bean-filter-chips .chip");
const tasteMatchBanner = document.getElementById("tasteMatchBanner");
const clearTasteMatchBtn = document.getElementById("clearTasteMatchBtn");

/**
 * 3. Render function: Generates an HTML card for a single bean
 */
function createBeanCardHTML(bean) {
    const roastClass = bean.roast.toLowerCase().replace(/\s+/g, "-");
    const flavorsHTML = bean.flavors.map((f) => `<span class="flavor-chip">${f}</span>`).join("");

    return `
        <article class="bean-card" id="${bean.id}">
            <div class="bean-card-content">
                <div class="bean-card-meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <span class="bean-estate-tag">🌱 ${bean.estate}</span>
                        <span class="roast-badge roast-${roastClass}">${bean.roast} Roast</span>
                    </div>
                    <button type="button" class="btn-bookmark" data-type="bean" data-id="${bean.id}" data-title="${bean.name}" data-subtitle="${bean.estate} • ${bean.roaster}" title="Save bean">
                        <span class="heart-icon">♡</span> <span class="btn-label">Save</span>
                    </button>
                </div>

                <h3 class="bean-card-title">${bean.name}</h3>
                
                <div class="bean-roaster-line">
                    <span>Roasted by </span>
                    <a href="${bean.roasterUrl}" target="_blank" rel="noopener noreferrer"><strong>${bean.roaster}</strong> ↗</a>
                </div>

                <p class="bean-card-description">${bean.description}</p>

                <!-- Flavor Notes Pills -->
                <div class="bean-flavors-row">
                    ${flavorsHTML}
                </div>

                <!-- Technical Specs Strip -->
                <div class="bean-specs-strip">
                    <div class="bean-spec-item">
                        <span>ALTITUDE</span>
                        <strong>${bean.altitude}</strong>
                    </div>
                    <div class="bean-spec-item">
                        <span>PROCESS</span>
                        <strong>${bean.process}</strong>
                    </div>
                    <div class="bean-spec-item">
                        <span>VARIETAL</span>
                        <strong>${bean.varietal}</strong>
                    </div>
                </div>

                <div class="bean-card-footer">
                    <span class="bean-milk-tag">${bean.milkFriendly ? "☕ Great with or without milk" : "✨ Best enjoyed black"}</span>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="add-to-stash-btn" onclick="SipwiseInventory.openAddBagModal({ coffeeName: '${bean.name.replace(/'/g, "\\'")}', roaster: '${bean.roaster.replace(/'/g, "\\'")}' })" title="Add this bag to your personal inventory">
                            + Add to My Bags
                        </button>
                        <button type="button" class="toggle-bean-reviews-btn" data-id="${bean.id}" data-name="${bean.name}">
                            ★ Community Reviews
                        </button>
                        <a href="${bean.shopUrl}" target="_blank" rel="noopener noreferrer" class="bean-shop-btn">
                            Shop bean ↗
                        </a>
                    </div>
                </div>

                <!-- Community Reviews Expansion Container -->
                <div class="bean-reviews-container" id="beanReviews-${bean.id}" style="display: none;"></div>
            </div>

            <div class="bean-card-visual">
                <img src="${bean.image}" alt="${bean.name}" loading="lazy">
                <span class="bean-process-badge">${bean.process}</span>
            </div>
        </article>
    `;
}

/**
 * 4. Main display function: Renders the list of beans
 */
function renderBeans(list) {
    if (list.length === 0) {
        beansGrid.innerHTML = "";
        noBeanResults.classList.remove("hidden");
        beanCount.textContent = "0 beans found";
        return;
    }

    noBeanResults.classList.add("hidden");
    beansGrid.innerHTML = list.map(createBeanCardHTML).join("");
    beanCount.textContent = `Showing ${list.length} of ${beans.length} specialty beans`;

    // Bind bookmarks
    if (window.SipwiseBookmarks) {
        window.SipwiseBookmarks.bindButtons();
    }

    // Attach review toggle listeners
    beansGrid.querySelectorAll(".toggle-bean-reviews-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const beanId = btn.dataset.id;
            const beanName = btn.dataset.name;
            const container = document.getElementById(`beanReviews-${beanId}`);
            if (!container) return;

            const isShown = container.style.display === "block";
            if (isShown) {
                container.style.display = "none";
                btn.textContent = "★ Community Reviews";
            } else {
                container.style.display = "block";
                btn.textContent = "▲ Hide Reviews";
                if (window.SipwiseReviews) {
                    window.SipwiseReviews.renderReviewSection(container, "bean", beanId, beanName);
                }
            }
        });
    });
}

/**
 * 5. Multi-criteria Filter Handler
 * Integrates: Search input + Category Chip + 3-step Taste Matcher
 */
function applyBeanFilters() {
    const query = beanSearchInput ? beanSearchInput.value.toLowerCase().trim() : "";

    const hasActiveTasteMatch = tastePreferences.method !== "all" || 
                                tastePreferences.flavor !== "all" || 
                                tastePreferences.milk !== "all";

    if (hasActiveTasteMatch && tasteMatchBanner) {
        tasteMatchBanner.classList.remove("hidden");
    } else if (tasteMatchBanner) {
        tasteMatchBanner.classList.add("hidden");
    }

    const filtered = beans.filter((bean) => {
        const name = bean.name.toLowerCase();
        const estate = bean.estate.toLowerCase();
        const roaster = bean.roaster.toLowerCase();
        const process = bean.process.toLowerCase();
        const roast = bean.roast.toLowerCase();
        const flavors = bean.flavors.join(" ").toLowerCase();

        // 1. Evaluate Quick Filter Chips (Roast / Process)
        let matchesChip = true;
        if (activeFilter === "light") {
            matchesChip = roast.includes("light");
        } else if (activeFilter === "medium") {
            matchesChip = roast.includes("medium");
        } else if (activeFilter === "dark") {
            matchesChip = roast.includes("dark");
        } else if (activeFilter === "washed") {
            matchesChip = process.includes("washed");
        } else if (activeFilter === "natural") {
            matchesChip = process.includes("natural");
        } else if (activeFilter === "experimental") {
            matchesChip = process.includes("experimental") || process.includes("maceration") || process.includes("smoked");
        } else if (activeFilter === "monsooned") {
            matchesChip = process.includes("monsooned");
        }

        // 2. Evaluate Taste Matcher Selections
        let matchesMethod = true;
        if (tastePreferences.method !== "all") {
            matchesMethod = bean.brewMethods.includes(tastePreferences.method);
        }

        let matchesFlavor = true;
        if (tastePreferences.flavor !== "all") {
            matchesFlavor = bean.flavorCategory === tastePreferences.flavor;
        }

        let matchesMilk = true;
        if (tastePreferences.milk === "milk") {
            matchesMilk = bean.milkFriendly === true;
        } else if (tastePreferences.milk === "black") {
            matchesMilk = bean.milkFriendly === false;
        }

        // 3. Evaluate Search Query
        let matchesQuery = true;
        if (query) {
            matchesQuery = name.includes(query) || 
                           estate.includes(query) || 
                           roaster.includes(query) || 
                           process.includes(query) || 
                           flavors.includes(query) || 
                           roast.includes(query);
        }

        return matchesChip && matchesMethod && matchesFlavor && matchesMilk && matchesQuery;
    });

    renderBeans(filtered);
}

// 6. Setup Interactive Taste Matcher Wizard Listeners
function setupTasteMatcher() {
    const methodBtns = document.querySelectorAll('[data-step="method"] .matcher-btn');
    const flavorBtns = document.querySelectorAll('[data-step="flavor"] .matcher-btn');
    const milkBtns = document.querySelectorAll('[data-step="milk"] .matcher-btn');

    methodBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            methodBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            tastePreferences.method = btn.dataset.value;
            applyBeanFilters();
        });
    });

    flavorBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            flavorBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            tastePreferences.flavor = btn.dataset.value;
            applyBeanFilters();
        });
    });

    milkBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            milkBtns.forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            tastePreferences.milk = btn.dataset.value;
            applyBeanFilters();
        });
    });

    if (clearTasteMatchBtn) {
        clearTasteMatchBtn.addEventListener("click", resetTasteMatcher);
    }
}

function resetTasteMatcher() {
    tastePreferences = { method: "all", flavor: "all", milk: "all" };
    document.querySelectorAll(".matcher-btn").forEach((b) => {
        if (b.dataset.value === "all") b.classList.add("selected");
        else b.classList.remove("selected");
    });
    applyBeanFilters();
}

// 7. Global Listeners
if (beanSearchInput) {
    beanSearchInput.addEventListener("input", applyBeanFilters);
}

beanFilterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        beanFilterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        applyBeanFilters();
    });
});

if (resetBeanSearchBtn) {
    resetBeanSearchBtn.addEventListener("click", () => {
        if (beanSearchInput) beanSearchInput.value = "";
        activeFilter = "all";
        beanFilterChips.forEach((c) => {
            if (c.dataset.filter === "all") c.classList.add("active");
            else c.classList.remove("active");
        });
        resetTasteMatcher();
        if (beanSearchInput) beanSearchInput.focus();
        applyBeanFilters();
    });
}

// 8. Auto-filter on Anchor Link or Initial Load
document.addEventListener("DOMContentLoaded", () => {
    setupTasteMatcher();

    // Check if URL has hash (e.g. #attikan-estate)
    const hash = window.location.hash.replace("#", "");
    if (hash) {
        const found = beans.find((b) => b.id === hash);
        if (found) {
            setTimeout(() => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 150);
        }
    }

    renderBeans(beans);
});
