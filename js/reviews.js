/**
 * Sipwise — Community Reviews & Ratings Engine
 * Dual-Mode: Supabase `reviews` table or Local Sandbox Store with rich pre-seeded data.
 */

(function () {
    const STORAGE_KEY_REVIEWS = "sipwise_community_reviews";
    let supabaseClient = null;

    // Realistic seed reviews for Indian roasters and beans
    const preSeededReviews = [
        {
            id: "rev_seed_1",
            userId: "usr_seed_101",
            authorName: "Karan Mehta",
            authorLocation: "Bengaluru",
            targetType: "roaster",
            targetId: "blue-tokai",
            rating: 5,
            brewMethod: "Hario V60 Pour-Over",
            title: "Pioneers of the Indian third-wave scene",
            comment:
                "Consistently fresh roast dates. Attikan Estate has been my daily morning pour-over for 3 years. Customer support and packaging are top tier.",
            flavorTags: ["Consistent Roast", "Fresh Pack", "Daily Driver"],
            helpfulCount: 14,
            createdAt: "2026-09-12T10:30:00.000Z"
        },
        {
            id: "rev_seed_2",
            userId: "usr_seed_102",
            authorName: "Divya Tandon",
            authorLocation: "Mumbai",
            targetType: "roaster",
            targetId: "subko",
            rating: 5,
            brewMethod: "AeroPress",
            title: "World-class branding and experimental processing",
            comment:
                "Their Crafters Series and fermentation lots from Meghalaya and Chikmagalur show just how high Indian specialty coffee can reach. The Bandra roastery is stunning.",
            flavorTags: ["Experimental Lots", "Fruit-Forward", "Artisanal"],
            helpfulCount: 19,
            createdAt: "2026-09-18T14:20:00.000Z"
        },
        {
            id: "rev_seed_3",
            userId: "usr_seed_103",
            authorName: "Rohan Iyer",
            authorLocation: "Chennai",
            targetType: "bean",
            targetId: "attikan-estate",
            rating: 5,
            brewMethod: "South Indian Filter",
            title: "Velvety, chocolatey, unbeatable with milk",
            comment:
                "Brewed in my brass filter with 80:20 ratio. Delivers a dense caramel crema and zero harsh bitterness. Truly an iconic Biligirirangana Hills harvest.",
            flavorTags: ["Dark Chocolate", "Roasted Almonds", "Sweet Jaggery"],
            helpfulCount: 22,
            createdAt: "2026-09-24T09:15:00.000Z"
        },
        {
            id: "rev_seed_4",
            userId: "usr_seed_104",
            authorName: "Ananya Sen",
            authorLocation: "Pune",
            targetType: "bean",
            targetId: "riverdale-yeast",
            rating: 5,
            brewMethod: "Hario V60 Pour-Over",
            title: "Mindblowing tropical aromatics",
            comment:
                "The N72 yeast fermentation smells like passion fruit and ripe mango as soon as hot water hits the coffee bed. Delicate citric acidity, tea-like finish.",
            flavorTags: ["Passion Fruit", "Ripe Mango", "Wild Florals"],
            helpfulCount: 11,
            createdAt: "2026-10-02T16:45:00.000Z"
        },
        {
            id: "rev_seed_5",
            userId: "usr_seed_105",
            authorName: "Siddharth Rao",
            authorLocation: "Bengaluru",
            targetType: "bean",
            targetId: "ratnagiri-carbonic",
            rating: 4,
            brewMethod: "AeroPress",
            title: "Super complex, best enjoyed slightly cooler",
            comment:
                "Ashok Patre's estate does it again. Winey notes with a candied cherry aftertaste. Dialed in at 88°C inverted AeroPress. Remarkable cup.",
            flavorTags: ["Winey / Fermented", "Candied Cherry", "Heavy Body"],
            helpfulCount: 8,
            createdAt: "2026-10-08T11:00:00.000Z"
        },
        {
            id: "rev_seed_6",
            userId: "usr_seed_106",
            authorName: "Pooja Hegde",
            authorLocation: "Hyderabad",
            targetType: "roaster",
            targetId: "araku",
            rating: 5,
            brewMethod: "Moka Pot",
            title: "Regenerative organic terroir is real",
            comment:
                "Signature and Grand Reserve both shine on stovetop and espresso. Love their tribal cooperative model and shade-grown traceability.",
            flavorTags: ["Organic", "Floral Jasmine", "Smooth Finish"],
            helpfulCount: 16,
            createdAt: "2026-10-14T18:10:00.000Z"
        }
    ];

    function initSupabase() {
        if (window.SIPWISE_CONFIG && window.SIPWISE_CONFIG.isSupabaseConfigured() && window.supabase) {
            supabaseClient = window.supabase.createClient(
                window.SIPWISE_CONFIG.SUPABASE_URL,
                window.SIPWISE_CONFIG.SUPABASE_ANON_KEY
            );
        }
    }

    function getLocalReviews() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn(e);
        }
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(preSeededReviews));
        return preSeededReviews;
    }

    function saveLocalReviews(reviews) {
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    }

    /**
     * Get reviews for a specific target
     */
    async function getReviews(targetType, targetId) {
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from("reviews")
                .select("*")
                .eq("target_type", targetType)
                .eq("target_id", targetId)
                .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
                return data.map((r) => ({
                    id: r.id,
                    userId: r.user_id,
                    authorName: r.author_name,
                    targetType: r.target_type,
                    targetId: r.target_id,
                    rating: r.rating,
                    brewMethod: r.brew_method,
                    title: r.title,
                    comment: r.comment,
                    flavorTags: r.flavor_tags || [],
                    helpfulCount: r.helpful_count || 0,
                    createdAt: r.created_at
                }));
            }
        }

        const all = getLocalReviews();
        return all.filter((r) => r.targetType === targetType && r.targetId === targetId);
    }

    /**
     * Get aggregated score and count
     */
    async function getAverageRating(targetType, targetId) {
        const reviews = await getReviews(targetType, targetId);
        if (reviews.length === 0) {
            return { average: 5.0, count: 0, rounded: "5.0" };
        }
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / reviews.length;
        return {
            average: avg,
            rounded: avg.toFixed(1),
            count: reviews.length
        };
    }

    /**
     * Add a new review
     */
    async function addReview({ targetType, targetId, rating, brewMethod, title, comment, flavorTags }) {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) {
            throw new Error("You must be signed in to submit a review.");
        }

        const newReview = {
            id: "rev_" + Math.random().toString(36).substring(2, 9),
            userId: user.id,
            authorName: user.fullName || "Coffee Enthusiast",
            targetType,
            targetId,
            rating: parseInt(rating, 10),
            brewMethod: brewMethod || user.favoriteBrew || "Pour-Over (V60)",
            title: title.trim(),
            comment: comment.trim(),
            flavorTags: Array.isArray(flavorTags) ? flavorTags : [],
            helpfulCount: 0,
            createdAt: new Date().toISOString()
        };

        if (supabaseClient) {
            await supabaseClient.from("reviews").insert({
                user_id: user.id,
                author_name: newReview.authorName,
                target_type: targetType,
                target_id: targetId,
                rating: newReview.rating,
                brew_method: newReview.brewMethod,
                title: newReview.title,
                comment: newReview.comment,
                flavor_tags: newReview.flavorTags
            });
        }

        const all = getLocalReviews();
        all.unshift(newReview);
        saveLocalReviews(all);

        return newReview;
    }

    /**
     * Delete an existing review by ID
     */
    async function deleteReview(reviewId) {
        const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        if (!user) {
            throw new Error("You must be signed in to delete a review.");
        }

        if (supabaseClient) {
            const { error } = await supabaseClient
                .from("reviews")
                .delete()
                .eq("id", reviewId);
            if (error) throw error;
        }

        let all = getLocalReviews();
        all = all.filter((r) => r.id !== reviewId);
        saveLocalReviews(all);
        return true;
    }

    /**
     * Render the complete review section HTML inside any container
     */
    async function renderReviewSection(container, targetType, targetId, targetName) {
        if (!container) return;

        const currentUser = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
        const { rounded, count } = await getAverageRating(targetType, targetId);
        const reviews = await getReviews(targetType, targetId);

        const starsHTML = "★".repeat(Math.round(rounded)) + "☆".repeat(5 - Math.round(rounded));

        container.innerHTML = `
        <div class="community-reviews-widget" data-type="${targetType}" data-id="${targetId}">
            <div class="reviews-header-bar">
                <div class="rating-overview">
                    <span class="rating-number">${rounded}</span>
                    <div class="rating-stars-wrap">
                        <span class="stars-gold">${starsHTML}</span>
                        <span class="reviews-count-text">${count} verified ${count === 1 ? "review" : "reviews"}</span>
                    </div>
                </div>
                <button type="button" class="write-review-btn" id="openReviewFormBtn">
                    Write a Review ✍
                </button>
            </div>

            <!-- Review Submission Form (Collapsible) -->
            <div id="reviewFormContainer" class="review-form-card" style="display: none;">
                <div class="form-title-row">
                    <h4>Review ${targetName}</h4>
                    <button type="button" class="form-close-x" id="closeReviewFormBtn">✕</button>
                </div>
                
                <form id="submitReviewForm">
                    <!-- Interactive Star Rating -->
                    <div class="review-field">
                        <label>Your Overall Rating</label>
                        <div class="star-rating-picker" id="starPicker">
                            <span class="star-pick" data-val="1">★</span>
                            <span class="star-pick" data-val="2">★</span>
                            <span class="star-pick" data-val="3">★</span>
                            <span class="star-pick" data-val="4">★</span>
                            <span class="star-pick active" data-val="5">★</span>
                        </div>
                        <input type="hidden" id="reviewRatingInput" value="5">
                    </div>

                    <!-- Brew Method -->
                    <div class="review-field">
                        <label for="reviewBrewMethod">Brewing Method Used</label>
                        <select id="reviewBrewMethod">
                            <option value="Hario V60 Pour-Over">Hario V60 Pour-Over</option>
                            <option value="South Indian Filter">South Indian Filter</option>
                            <option value="AeroPress">AeroPress</option>
                            <option value="French Press">French Press</option>
                            <option value="Moka Pot">Moka Pot</option>
                            <option value="Cold Brew">Cold Brew</option>
                            <option value="Espresso">Espresso</option>
                        </select>
                    </div>

                    <!-- Review Headline -->
                    <div class="review-field">
                        <label for="reviewTitle">Headline / Summary</label>
                        <input type="text" id="reviewTitle" required placeholder="e.g. Delicious morning cup with vibrant citrus notes">
                    </div>

                    <!-- Review Text -->
                    <div class="review-field">
                        <label for="reviewComment">Tasting Notes & Impressions</label>
                        <textarea id="reviewComment" rows="3" required placeholder="Describe aroma, acidity, mouthfeel, sweetness, or your brewing recipe..."></textarea>
                    </div>

                    <!-- Flavor Tags -->
                    <div class="review-field">
                        <label>Flavor Tags (Select all that apply)</label>
                        <div class="flavor-tag-picker" id="flavorTagPicker">
                            <button type="button" class="tag-opt" data-tag="Fruit-Forward">Fruit-Forward</button>
                            <button type="button" class="tag-opt" data-tag="Dark Chocolate">Dark Chocolate</button>
                            <button type="button" class="tag-opt" data-tag="Caramel / Nutty">Caramel / Nutty</button>
                            <button type="button" class="tag-opt" data-tag="Bright Acidity">Bright Acidity</button>
                            <button type="button" class="tag-opt" data-tag="Floral / Jasmine">Floral / Jasmine</button>
                            <button type="button" class="tag-opt" data-tag="Smooth Body">Smooth Body</button>
                        </div>
                    </div>

                    <div class="form-action-row">
                        <button type="submit" class="submit-review-btn" id="postReviewBtn">Post Verified Review</button>
                        <button type="button" class="cancel-review-btn" id="cancelReviewBtn">Cancel</button>
                    </div>
                </form>
            </div>

            <!-- Reviews List Stream -->
            <div class="reviews-list-stream">
                ${
                    reviews.length === 0
                        ? `<p class="no-reviews-note">No community reviews yet. Be the first to share your tasting impression!</p>`
                        : reviews
                              .map((r) => {
                                  const initials = r.authorName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase();
                                  const dateFormatted = new Date(r.createdAt).toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                  });
                                  const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
                                  const isOwner = currentUser && (currentUser.id === r.userId || currentUser.email === r.userId);

                                  return `
                            <article class="single-review-card" data-review-id="${r.id}">
                                <div class="review-card-top">
                                    <div class="reviewer-info">
                                        <div class="reviewer-avatar">${initials}</div>
                                        <div>
                                            <div class="reviewer-name-row">
                                                <strong>${r.authorName}</strong>
                                                <span class="verified-buyer-badge">✓ Verified Enthusiast</span>
                                            </div>
                                            <div class="review-meta-line">
                                                <span class="review-stars-gold">${stars}</span>
                                                <span class="review-date">${dateFormatted}</span>
                                                <span class="review-gear-tag">☕ ${r.brewMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${
                                        isOwner
                                            ? `<button type="button" class="delete-review-btn" data-id="${r.id}" title="Delete your review">🗑 Delete</button>`
                                            : ""
                                    }
                                </div>
                                <h5 class="review-headline">${r.title}</h5>
                                <p class="review-body-text">${r.comment}</p>
                                ${
                                    r.flavorTags && r.flavorTags.length > 0
                                        ? `
                                    <div class="review-tags-row">
                                        ${r.flavorTags.map((t) => `<span class="review-chip">${t}</span>`).join("")}
                                    </div>
                                `
                                        : ""
                                }
                            </article>
                        `;
                              })
                              .join("")
                }
            </div>
        </div>
        `;

        // Bind interactive elements
        const openBtn = container.querySelector("#openReviewFormBtn");
        const closeBtn = container.querySelector("#closeReviewFormBtn");
        const cancelBtn = container.querySelector("#cancelReviewBtn");
        const formCard = container.querySelector("#reviewFormContainer");
        const form = container.querySelector("#submitReviewForm");
        const starPickers = container.querySelectorAll(".star-pick");
        const ratingInput = container.querySelector("#reviewRatingInput");
        const tagOpts = container.querySelectorAll(".tag-opt");

        // Bind delete buttons for reviews authored by the current user
        container.querySelectorAll(".delete-review-btn").forEach((delBtn) => {
            delBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const reviewId = delBtn.dataset.id;
                if (!confirm("Are you sure you want to delete this review?")) {
                    return;
                }
                delBtn.disabled = true;
                delBtn.textContent = "Deleting...";

                try {
                    await deleteReview(reviewId);
                    await renderReviewSection(container, targetType, targetId, targetName);
                } catch (err) {
                    alert(err.message || "Failed to delete review.");
                    delBtn.disabled = false;
                    delBtn.textContent = "🗑 Delete";
                }
            });
        });

        // Open Form with Auth Guard
        openBtn.addEventListener("click", () => {
            const user = window.SipwiseAuth ? window.SipwiseAuth.getCurrentUser() : null;
            if (!user) {
                window.SipwiseAuth.openAuthModal("signin", () => {
                    formCard.style.display = "block";
                    openBtn.style.display = "none";
                });
                return;
            }
            formCard.style.display = "block";
            openBtn.style.display = "none";
        });

        const hideForm = () => {
            formCard.style.display = "none";
            openBtn.style.display = "inline-block";
        };

        closeBtn.addEventListener("click", hideForm);
        cancelBtn.addEventListener("click", hideForm);

        // Star picker click
        starPickers.forEach((star) => {
            star.addEventListener("click", () => {
                const val = parseInt(star.dataset.val, 10);
                ratingInput.value = val;
                starPickers.forEach((s) => {
                    const sVal = parseInt(s.dataset.val, 10);
                    s.classList.toggle("active", sVal <= val);
                });
            });
        });

        // Flavor tag toggle
        tagOpts.forEach((btn) => {
            btn.addEventListener("click", () => {
                btn.classList.toggle("active");
            });
        });

        // Form submit
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rating = ratingInput.value;
            const brewMethod = container.querySelector("#reviewBrewMethod").value;
            const title = container.querySelector("#reviewTitle").value;
            const comment = container.querySelector("#reviewComment").value;
            const selectedTags = Array.from(container.querySelectorAll(".tag-opt.active")).map(
                (btn) => btn.dataset.tag
            );

            const postBtn = container.querySelector("#postReviewBtn");
            postBtn.disabled = true;
            postBtn.textContent = "Posting...";

            try {
                await addReview({
                    targetType,
                    targetId,
                    rating,
                    brewMethod,
                    title,
                    comment,
                    flavorTags: selectedTags
                });

                // Re-render
                await renderReviewSection(container, targetType, targetId, targetName);
            } catch (err) {
                alert(err.message || "Failed to post review.");
                postBtn.disabled = false;
                postBtn.textContent = "Post Verified Review";
            }
        });
    }

    // Public API
    window.SipwiseReviews = {
        getReviews,
        getAverageRating,
        addReview,
        deleteReview,
        renderReviewSection
    };

    document.addEventListener("DOMContentLoaded", () => {
        initSupabase();
    });
})();
