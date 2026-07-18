document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const keywordInput = document.getElementById("search-keyword");
  const categorySelect = document.getElementById("search-category");
  const productsGrid = document.getElementById("products-grid");
  const loadingIndicator = document.getElementById("loading-indicator");
  const errorMessage = document.getElementById("error-message");
  const resultsSummary = document.getElementById("results-summary");

  if (!form || !keywordInput || !productsGrid) return;

  async function fetchProducts({ keyword, category, page = 1 }) {
    if (!BACKEND_BASE_URL) return [];

    const params = new URLSearchParams();
    params.set("keyword", keyword);
    if (category) params.set("category", category);
    params.set("page", String(page));

    const url = `${BACKEND_BASE_URL.replace(/\/$/, "")}/api/search?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  function renderProducts(items) {
    productsGrid.innerHTML = "";

    if (!items.length) {
      resultsSummary.textContent = "No products found for your search.";
      return;
    }

    resultsSummary.textContent = `Showing ${items.length} product${
      items.length > 1 ? "s" : ""
    } for your search.`;

    for (const item of items) {
      const card = document.createElement("article");
      card.className = "product-card";

      const imageWrapper = document.createElement("div");
      imageWrapper.className = "product-image-wrapper";
      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title || "Product image";
        img.loading = "lazy";
        imageWrapper.appendChild(img);
      }

      const titleEl = document.createElement("h3");
      titleEl.className = "product-title";
      titleEl.textContent = item.title || "Untitled product";

      const meta = document.createElement("div");
      meta.className = "product-meta";
      const price = document.createElement("span");
      price.className = "price-tag";
      price.textContent = item.price || "See price on Amazon";
      const rating = document.createElement("span");
      rating.className = "rating";
      if (item.rating) {
        const star = document.createElement("span");
        star.className = "rating-star";
        star.textContent = "★";
        const value = document.createElement("span");
        value.textContent = item.rating;
        rating.appendChild(star);
        rating.appendChild(value);
      }
      meta.appendChild(price);
      if (item.rating) {
        meta.appendChild(rating);
      }

      const footer = document.createElement("div");
      footer.className = "product-footer";

      const note = document.createElement("span");
      note.className = "product-note";
      note.textContent = "View details on Amazon";

      const cta = document.createElement("a");
      cta.className = "product-cta";
      cta.target = "_blank";
      cta.rel = "noopener noreferrer";
      cta.textContent = "View on Amazon";
      if (item.url) {
        cta.href = item.url;
      } else {
        cta.href = "#";
        cta.setAttribute("aria-disabled", "true");
      }

      footer.appendChild(note);
      footer.appendChild(cta);

      card.appendChild(imageWrapper);
      card.appendChild(titleEl);
      card.appendChild(meta);
      card.appendChild(footer);

      productsGrid.appendChild(card);
    }
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
    const keyword = keywordInput.value.trim();
    const category = categorySelect ? categorySelect.value : "";

    if (!keyword) {
      resultsSummary.textContent = "Please enter a keyword to search.";
      return;
    }

    loadingIndicator.hidden = false;
    errorMessage.hidden = true;
    errorMessage.textContent = "";

    try {
      const items = await fetchProducts({ keyword, category, page: 1 });
      renderProducts(items);
    } catch (error) {
      console.error("[Aliza Picks] Search error", error);
      errorMessage.hidden = false;
      errorMessage.textContent =
        "Unable to load products right now. Please try again in a moment.";
      resultsSummary.textContent = "There was an error loading products.";
    } finally {
      loadingIndicator.hidden = true;
    }
  }

  form.addEventListener("submit", handleSearchSubmit);

  if (typeof DEFAULT_SEARCH_KEYWORD === "string" && DEFAULT_SEARCH_KEYWORD) {
    keywordInput.value = DEFAULT_SEARCH_KEYWORD;
    if (categorySelect && DEFAULT_SEARCH_CATEGORY) {
      categorySelect.value = DEFAULT_SEARCH_CATEGORY;
    }
    form.dispatchEvent(new Event("submit"));
  }
});


