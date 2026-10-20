/**
 * Sipwise — Editorial Blog & Stories Engine
 */

(function () {
    const blogArticles = [
        {
            id: "fermentation-frontier-indian-coffee",
            slug: "fermentation-frontier",
            title: "The Fermentation Frontier: How Carbonic Maceration & Yeast Transform Indian Terroir",
            category: "Processing & Science",
            author: "Dr. Sunita Hegde",
            authorRole: "Coffee Agronomist & Q-Grader",
            readTime: "5 min read",
            publishedAt: "October 14, 2026",
            featured: true,
            image: "images/coffee-cherries.jpg",
            excerpt: "Indian planters in Chikmagalur and Shevaroys are moving beyond traditional washed processing into hermetic stainless tanks, anaerobic fermentation, and champagne yeast cultures.",
            content: `
                <p>For decades, Indian coffee was globally categorized primarily as a clean, mild washed arabica or a neutral filler robusta. However, over the past four harvest cycles, a quiet revolution has taken root across the estates of the Western and Eastern Ghats.</p>

                <h3>Beyond the Traditional Washing Channel</h3>
                <p>Pioneering estate managers like Ashok Patre (Ratnagiri Estate) and DP Kumar (Riverdale Estate) have radically shifted the paradigm. By borrowing temperature-controlled stainless steel fermentation tanks from winemakers and introducing isolated yeast strains (such as N72 and Lalcafe Intenso), producers can control the metabolic breakdown of mucilage sugars with clinical precision.</p>

                <blockquote>"Fermentation is no longer just a way to strip pulp off parchment; it is an active flavor-sculpting canvas."</blockquote>

                <h3>Tasting the Impact in the Cup</h3>
                <p>In standard washed lots, Indian coffees emphasize nutty hazelnut, milk chocolate, and mild malic acidity. In contrast, yeast-inoculated lots produce explosive tropical top-notes: ripe passion fruit, mango nectar, and jasmine florals that rival high-elevation Geishas from Central America.</p>

                <h3>What This Means for Home Baristas</h3>
                <p>When dialing in anaerobic or carbonic maceration lots on your V60 or AeroPress, baristas should aim for slightly lower water temperatures (88°C to 90°C). The delicate aromatic esters created during anaerobic fermentation are volatile; gentler brew temperatures preserve the sweet floral bouquet without introducing astringency.</p>
            `
        },
        {
            id: "monsooned-malabar-sea-voyages-physics",
            slug: "monsooned-malabar",
            title: "Monsooned Malabar: The Forgotten Sea Voyages & Physics of Aged Coffee",
            category: "Estate Stories",
            author: "Prashant Nair",
            authorRole: "Coffee Historian & Roaster",
            readTime: "5 min read",
            publishedAt: "October 18, 2026",
            featured: false,
            image: "images/coffee-beans-aged.jpg",
            excerpt: "How 19th-century wooden clipper sailing ships accidentally created India's most famous coffee, swelling beans to twice their size under humid ocean gales.",
            content: `
                <p>During the British Raj, raw green coffee beans from the southern Malabar Coast made a perilous four-month sea voyage to Europe around the Cape of Good Hope. Packed deep within wooden hulls, the beans absorbed moisture from saline ocean air, undergoing a dramatic metamorphosis before reaching London ports.</p>

                <h3>The Atmospheric Metamorphosis</h3>
                <p>By the time the cargo docked, the hard green beans had turned a pale, golden-straw yellow, doubled in physical volume, and lost virtually all perceived acidity. When modern steamships shortened the voyage to three weeks through the Suez Canal, European consumers complained that their coffee lacked its signature creamy, mellow body.</p>

                <h3>Recreating the Magic on Shore</h3>
                <p>To preserve this historic cup profile, coastal curing houses in Mangalore and Kozhikode created the "monsooning" process. Between June and September, dry-processed cherries are spread in open-sided brick warehouses where moisture-laden southwest monsoon winds blow freely across them. Workers rake and turn the beans every few hours for 12 to 16 weeks.</p>

                <blockquote>"Monsooned Malabar possesses a sensory profile found nowhere else on earth: pipe tobacco, malted dark chocolate, damp earth, and a velvety crema that creates the foundation of legendary espresso blends."</blockquote>

                <h3>Brewing Recommendations</h3>
                <p>Because monsooned beans are less dense and more porous, they extract quickly. Use slightly coarser grinds and shorter contact times on French Press or Moka Pot. It is also phenomenal as a base in modern South Indian brass filters with full-fat milk.</p>
            `
        },
        {
            id: "shade-grown-heritage-western-ghats",
            slug: "shade-grown-heritage",
            title: "Shade-Grown Heritage: Why India’s Canopy Farming Produces Sweeter Beans",
            category: "Estate Stories",
            author: "Rahul Varma",
            authorRole: "Origin Researcher",
            readTime: "4 min read",
            publishedAt: "October 02, 2026",
            featured: false,
            image: "images/shade-canopy.jpg",
            excerpt: "Unlike sun-drenched monoculture plantations in Brazil, virtually 100% of Indian specialty coffee is cultivated under a biodiverse two-tier natural jungle canopy.",
            content: `
                <p>India stands alone in the global coffee landscape as the only nation where coffee is grown almost entirely under dense, natural two-tier shade. Silver oaks, jackfruit trees, fig trees, and wild cardamom bushes form a living protective ceiling over the coffee shrubs.</p>

                <h3>Slow Maturation = Complex Sugars</h3>
                <p>When coffee cherries develop under partial sunlight, photosynthesis proceeds slowly and steadily. Cherries spend up to two additional months on the branch before reaching peak ripeness. This extended ripening window allows the plant to pack the seed with high concentrations of sucrose and organic acids.</p>

                <h3>Natural Soil Microbiome</h3>
                <p>Leaf litter falling from diverse forest trees decomposes into nutrient-rich humus, eliminating the need for heavy chemical fertilizers. The resulting cups display low natural bitterness, creamy mouthfeel, and deep caramelized sweetness—ideal for medium and light-medium roasts.</p>
            `
        },
        {
            id: "science-of-the-coffee-bloom",
            slug: "science-of-coffee-bloom",
            title: "The Science of Coffee Bloom: Degassing Dynamics & Extraction Clarity",
            category: "Processing & Science",
            author: "Dr. Sunita Hegde",
            authorRole: "Coffee Agronomist & Q-Grader",
            readTime: "4 min read",
            publishedAt: "October 08, 2026",
            featured: false,
            image: "images/cupping-session.jpg",
            excerpt: "Why fresh roasts need resting, what happens during the first 45 seconds of pouring, and how trapped CO₂ physically repels water if rushed.",
            content: `
                <p>When you pour hot water over fresh coffee grounds and watch the bed swell and bubble like a miniature soufflé, you are witnessing one of the most critical chemical events in coffee extraction: <em>the bloom</em>.</p>

                <h3>Why Do Fresh Beans Bubble?</h3>
                <p>During the roasting process, high temperatures trigger the Maillard reaction and Strecker degradation, generating massive quantities of carbon dioxide gas (CO₂) trapped inside the coffee bean's microscopic cellulose matrix. A single 250g bag of freshly roasted beans contains several liters of trapped CO₂.</p>

                <h3>Gas is Hydrophobic: The Extraction Shield</h3>
                <p>Carbon dioxide gas is actively hydrophobic—it pushes water molecules away from the surface of the coffee grounds. If you pour your entire brew volume immediately without blooming, water takes the path of least resistance around the gas bubbles, tunneling down the sides of the paper filter (severe channeling). Your cup ends up sour, weak, and astringent.</p>

                <blockquote>"The bloom is a controlled degassing truce: you sacrifice 45 seconds and 3x coffee weight to evacuate the gas, paving the way for complete, uniform water saturation."</blockquote>

                <h3>The Golden Rules for the Perfect Bloom</h3>
                <ul>
                    <li><strong>Ratio:</strong> Use 2.5x to 3x your coffee dose in water (e.g., 45g to 50g of water for a 15g dose).</li>
                    <li><strong>Agitation:</strong> Give your dripper one gentle swirl right after pouring the bloom water to ensure every grain is saturated.</li>
                    <li><strong>Time:</strong> Wait 40 to 45 seconds before starting pour number two. For ultra-fresh roasts (less than 7 days from roast date), extend the bloom to 50 seconds.</li>
                </ul>
            `
        },
        {
            id: "mastering-water-temperature-grind",
            slug: "mastering-water-temperature-grind",
            title: "Mastering the Pour-Over: The Physics of Water Temp and Channeling",
            category: "Brewing Rituals",
            author: "Barista Neil Joseph",
            authorRole: "Head Barista & Trainer",
            readTime: "6 min read",
            publishedAt: "September 28, 2026",
            featured: false,
            image: "images/v60-pour-over.jpg",
            excerpt: "Dialing in a specialty cup is a balance of solubility, flow rate, and grind distribution. Here is how to eliminate astringency and unlock sweetness.",
            content: `
                <p>Have you ever brewed two consecutive cups of the exact same bean using identical coffee weights, yet one tasted sweet and vibrant while the other tasted flat and dry? The culprit is almost always channeling and inconsistent thermal conductivity.</p>

                <h3>The Golden Temperature Windows</h3>
                <ul>
                    <li><strong>Light Roasts (92°C – 94°C):</strong> Dense cellular structure requires higher kinetic energy to dissolve desirable organic acids and aromatic compounds.</li>
                    <li><strong>Medium Roasts (90°C – 92°C):</strong> Sweet spot for chocolate, stone fruit, and caramel notes without scorch.</li>
                    <li><strong>Dark & Chicory Blends (86°C – 88°C):</strong> Lower heat prevents the extraction of harsh pyrolytic bitter compounds.</li>
                </ul>

                <h3>Concentric Pours vs Wall Splashing</h3>
                <p>Pour in steady, deliberate concentric spirals moving outward from the center, stopping approximately 1 centimeter before reaching the paper edge. Pouring directly onto the filter walls causes bypass, diluting your brew without extracting flavor from the coffee bed.</p>
            `
        },
        {
            id: "water-chemistry-minerals-playbook",
            slug: "water-chemistry-minerals",
            title: "The Water Chemistry Playbook: How Minerals Dictate Flavor in Your Cup",
            category: "Brewing Rituals",
            author: "Barista Neil Joseph",
            authorRole: "Head Barista & Trainer",
            readTime: "6 min read",
            publishedAt: "September 22, 2026",
            featured: false,
            image: "images/coffee-lifestyle.jpg",
            excerpt: "Coffee is 98.5% water. Discover why municipal tap water in Bengaluru vs Mumbai produces entirely different flavor profiles from the exact same bean.",
            content: `
                <p>You can buy the most expensive single-estate anaerobic Geisha, grind it on a precision burr grinder, and brew it on a calibrated dripper—but if your brew water is out of balance, your cup will taste chalky, sour, or dull. Coffee is 98.5% water, and the dissolved minerals in that water act as the chemical "magnets" that pull flavors out of the bean.</p>

                <h3>The Key Players: Calcium, Magnesium & Bicarbonates</h3>
                <ul>
                    <li><strong>Magnesium (Mg²⁺):</strong> The flavor champion. Magnesium ions have high charge density and strongly attract oxygen-rich aromatic compounds like fruity esters, citric acids, and floral terpenes.</li>
                    <li><strong>Calcium (Ca²⁺):</strong> Good for body and heavy chocolate notes, but can over-extract astringent compounds if present in excess.</li>
                    <li><strong>Bicarbonate Alkalinity (Buffer):</strong> Neutralizes excess acidity. Too much buffer, and your sparkling fruity acidity turns chalky and flat; too little, and the cup tastes sharply sour like lemon juice.</li>
                </ul>

                <h3>The Ideal Specialty Water Targets (SCA Standard)</h3>
                <p>Aim for a Total Dissolved Solids (TDS) reading between 120 and 150 ppm, with a total hardness of 68 mg/L CaCO₃ equivalent and an alkalinity buffer around 40 mg/L.</p>

                <blockquote>"If you live in a city with hard borewell water (high TDS above 300), your coffee will taste flat and muddy. Diluting RO water with mineral concentrate drops will instantly resurrect the vibrant aromatics of your specialty beans."</blockquote>
            `
        },
        {
            id: "rise-of-indian-specialty-robusta",
            slug: "rise-of-specialty-robusta",
            title: "The Rise of Indian Specialty Robusta: From Commodity Filler to Global Stage",
            category: "Processing & Science",
            author: "Kavitha Swaminathan",
            authorRole: "Sensory Specialist",
            readTime: "5 min read",
            publishedAt: "September 10, 2026",
            featured: false,
            image: "images/coffee-roaster-drums.jpg",
            excerpt: "High-elevation Wayanad and Coorg Robusta clones, selective picking, and anaerobic processing are proving that Robusta can be extraordinary.",
            content: `
                <p>For almost a century, commercial Robusta was dismissed as the unrefined cousin of Arabica—grown at low elevations, harvested haphazardly with strip-picking, and roasted dark for cheap instant coffee or pungent espresso crema.</p>

                <p>Today, Indian specialty growers in Wayanad, Coorg, and the Anamalais are proving the global specialty coffee industry wrong.</p>

                <h3>CXR Clones & High-Altitude Cultivation</h3>
                <p>Unlike African lowland wild robustas, Indian specialty robusta is predominantly cultivated above 900 to 1,200 meters. Varieties like CXR (Congensis x Robusta hybrid) produce beans with significantly lower pyrazine bitterness, higher sweetness, and dense bean structure.</p>

                <h3>Fine Robusta Standards</h3>
                <p>When planters apply the same rigorous hand-picking standards to robusta as they do to competition arabica—selecting only blood-red ripe cherries, employing controlled anaerobic honey drying, and cupping with the CQI Fine Robusta protocol—the resulting cup displays astonishing tasting notes: cacao nibs, toasted sesame, salted caramel, and dried black currant.</p>

                <blockquote>"World Barista Championship competitors are now openly featuring Indian Fine Robustas in their milk course presentations, praising its syrupy tactile weight and natural sweetness."</blockquote>
            `
        },
        {
            id: "south-indian-filter-modern-twist",
            slug: "south-indian-filter-modern-twist",
            title: "South Indian Filter 2.0: Crafting Single-Estate Micro-Lot Decoctions",
            category: "Brewing Rituals",
            author: "Kavitha Swaminathan",
            authorRole: "Traditional Roaster & Sensory Specialist",
            readTime: "4 min read",
            publishedAt: "September 15, 2026",
            featured: false,
            image: "images/south-indian-filter.jpg",
            excerpt: "Forget commercial blends loaded with 40% chicory. Discover how single-estate estate beans transform the iconic tumbler-davarah ritual into an artisanal experience.",
            content: `
                <p>For more than a century, the South Indian Filter has been synonymous with dark, pungent chicory blends masked by scalded milk and generous spoonfuls of sugar. But in modern third-wave coffee bars, baristas are giving this historic brass brewer a magnificent renaissance.</p>

                <h3>The Specialty Formula</h3>
                <p>By using 100% Arabica or a 90:10 Arabica-Peaberry blend roasted to a medium-dark profile (such as Attikan Estate or Kelagur Pulp Sun-Dried), the decoction extracted over 12 minutes develops a natural viscosity reminiscent of melted dark chocolate and jaggery.</p>

                <h3>The Tumbler Aeration Technique</h3>
                <p>Pouring the hot drink back and forth between the stainless steel tumbler and davarah is not just theatrical performance—it rapidly aerates the coffee-milk emulsion, integrating micro-bubbles into the milk lipids for a silky, velvety mouthfeel that rivals an espresso flat white.</p>
            `
        }
    ];

    function getAllArticles() {
        return blogArticles;
    }

    function getArticleById(id) {
        return blogArticles.find((a) => a.id === id || a.slug === id);
    }

    /**
     * Render Reader Modal
     */
    function openArticleReader(articleId) {
        const article = getArticleById(articleId);
        if (!article) return;

        let modal = document.getElementById("blogReaderModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "blogReaderModal";
            modal.className = "sipwise-modal-overlay";
            modal.setAttribute("aria-hidden", "true");
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="sipwise-modal-dialog blog-reader-dialog" role="dialog" aria-modal="true">
                <button type="button" class="modal-close-btn" id="closeReaderBtn" aria-label="Close article">✕</button>
                <div class="article-reader-header">
                    <span class="auth-brand-badge">${article.category.toUpperCase()}</span>
                    <h2>${article.title}</h2>
                    <div class="article-byline">
                        <span class="author-name">By ${article.author} (${article.authorRole})</span>
                        <span class="article-dot">•</span>
                        <span class="article-readtime">${article.readTime}</span>
                        <span class="article-dot">•</span>
                        <span class="article-date">${article.publishedAt}</span>
                    </div>
                </div>

                <div class="article-reader-body">
                    ${article.content}
                </div>

                <div class="article-reader-footer">
                    <div class="share-actions">
                        <button type="button" class="btn-bookmark" data-type="blog" data-id="${article.id}" data-title="${article.title}">
                            <span class="heart-icon">♡</span> <span class="btn-label">Save Article</span>
                        </button>
                    </div>
                    <button type="button" class="nav-button" id="closeReaderBottomBtn">Done Reading</button>
                </div>
            </div>
        `;

        modal.classList.add("is-visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        const closeBtn = modal.querySelector("#closeReaderBtn");
        const bottomBtn = modal.querySelector("#closeReaderBottomBtn");
        const close = () => {
            modal.classList.remove("is-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        };

        closeBtn.addEventListener("click", close);
        bottomBtn.addEventListener("click", close);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) close();
        });

        if (window.SipwiseBookmarks && window.SipwiseBookmarks.bindButtons) {
            window.SipwiseBookmarks.bindButtons();
        }
    }

    /**
     * Render Blog Feed on blog.html
     */
    function renderBlogFeed(activeCategory = "All") {
        const gridContainer = document.getElementById("blogPostsGrid");
        if (!gridContainer) return;

        const filtered =
            activeCategory === "All"
                ? blogArticles
                : blogArticles.filter((a) => a.category === activeCategory);

        gridContainer.innerHTML = filtered
            .map((article) => {
                return `
                <article class="blog-card" data-id="${article.id}">
                    <div class="blog-card-img-wrap">
                        <img src="${article.image}" alt="${article.title}" loading="lazy">
                        <span class="blog-category-chip">${article.category}</span>
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span>${article.readTime}</span>
                            <span>•</span>
                            <span>${article.publishedAt}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p class="blog-card-excerpt">${article.excerpt}</p>
                        <div class="blog-card-footer">
                            <span class="blog-author-tag">By ${article.author}</span>
                            <button type="button" class="read-story-btn" onclick="SipwiseBlog.openArticleReader('${article.id}')">
                                Read Story ↗
                            </button>
                        </div>
                    </div>
                </article>
            `;
            })
            .join("");
    }

    // Public API
    window.SipwiseBlog = {
        getAllArticles,
        getArticleById,
        openArticleReader,
        renderBlogFeed
    };

    document.addEventListener("DOMContentLoaded", () => {
        const feedGrid = document.getElementById("blogPostsGrid");
        if (feedGrid) {
            renderBlogFeed("All");

            const filterChips = document.querySelectorAll(".blog-filter-chips .blog-filter-btn");
            filterChips.forEach((btn) => {
                btn.addEventListener("click", () => {
                    filterChips.forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderBlogFeed(btn.dataset.category);
                });
            });
        }
    });
})();
