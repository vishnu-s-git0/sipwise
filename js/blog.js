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
            image: "images/arabica-plant.jpg",
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
            id: "shade-grown-heritage-western-ghats",
            slug: "shade-grown-heritage",
            title: "Shade-Grown Heritage: Why India’s Canopy Farming Produces Sweeter Beans",
            category: "Estate Stories",
            author: "Rahul Varma",
            authorRole: "Origin Researcher",
            readTime: "4 min read",
            publishedAt: "October 02, 2026",
            featured: false,
            image: "images/coffee-cherries.jpg",
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

                <h3>The 45-Second Bloom Rule</h3>
                <p>Freshly roasted specialty coffee holds trapped carbon dioxide inside its cellular pores. If you pour through without an adequate bloom, degassing gas bubbles push your water outward toward the filter walls, bypassing the coffee grounds entirely. Always saturate with 3x coffee weight and wait a full 45 seconds before starting your spiral pours.</p>
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
