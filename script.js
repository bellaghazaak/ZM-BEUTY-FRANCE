const products = [
    {
        id: 1,
        name: "Sac Élégance",
        category: "Accessoires",
        price: 29.90,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
    },
    {
        id: 2,
        name: "Lunettes Chic",
        category: "Accessoires",
        price: 14.90,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
    },
    {
        id: 3,
        name: "Sac à main",
        category: "Accessoires",
        price: 34.90,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"
    },
    {
        id: 4,
        name: "Montre Élégante",
        category: "Accessoires",
        price: 24.90,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600"
    },
    {
        id: 5,
        name: "Style Féminin",
        category: "Vêtements",
        price: 39.90,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
    },
    {
        id: 6,
        name: "Collection Mode",
        category: "Vêtements",
        price: 44.90,
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600"
    }
];

let cart = [];
const deliveryFee = 8;
let feedbackTimer;

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const sortInput = document.getElementById("sort");

function normalizeText(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function showFeedback(message) {
    const feedback = document.getElementById("cart-feedback");
    feedback.textContent = message;
    feedback.hidden = false;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 3000);
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function scrollToSection(section) {
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " DT";
}

function renderProducts() {
    const query = normalizeText(searchInput.value);
    const activeCategory = document.querySelector(".filter.active").dataset.category;

    const filtered = products.filter(product => {
        const matchName =
            normalizeText(product.name).includes(query);

        return matchName &&
            (activeCategory === "Tous" ||
             product.category === activeCategory);
    });

    if (sortInput.value === "price-asc") filtered.sort((first, second) => first.price - second.price);
    if (sortInput.value === "price-desc") filtered.sort((first, second) => second.price - first.price);
    if (sortInput.value === "name") filtered.sort((first, second) => first.name.localeCompare(second.name, "fr"));
    document.getElementById("product-count").textContent = `${filtered.length} pièce${filtered.length !== 1 ? "s" : ""} dans la sélection`;

    productList.innerHTML = "";

    if (!filtered.length) {
        productList.innerHTML = '<div class="empty-state"><h3>Ma l9itech elli tlawej 3lih ?</h3><p>Essayez un autre mot, ou envoyez-nous une photo du produit.</p><a href="#sur-demande">Demander un produit par photo ↗</a><br><button type="button" data-reset>Voir tous les produits</button></div>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <img class="product-image"
                 src="${product.image}"
                 alt="${product.name}" loading="lazy" decoding="async" width="600" height="700">
            <div class="product-info">
            <p class="category">${product.category}</p>
            <h3>${product.name}</h3>
            <p class="price">${formatPrice(product.price)}</p>
            <button data-add="${product.id}" aria-label="Ajouter ${product.name} au panier">
                Ajouter · Zid lel panier <span aria-hidden="true">+</span>
            </button>
            </div>
        `;

        productList.appendChild(card);
    });
}

function renderCart() {
    const container = document.getElementById("cart-items");

    container.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        container.innerHTML += `
            <div class="cart-row">
                <div class="cart-product"><img src="${item.image}" alt="" width="56" height="68" loading="lazy"><div><strong>${item.name}</strong><span>${formatPrice(item.price)} / pièce</span></div></div>
                <div class="cart-actions"><div class="quantity-control"><button type="button" data-quantity="${item.id}" data-change="-1" aria-label="Diminuer la quantité de ${item.name}">−</button><span aria-label="Quantité">${item.quantity}</span><button type="button" data-quantity="${item.id}" data-change="1" aria-label="Augmenter la quantité de ${item.name}">+</button></div><span>${formatPrice(item.price * item.quantity)}</span>
                <button class="remove-button" data-remove="${item.id}" aria-label="Supprimer ${item.name} du panier">
                    Supprimer
                </button>
                </div>
            </div>
        `;
    });

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><p>Votre sélection commence ici.</p><a href="#produits">Découvrir les produits ↗</a></div>';
        document.getElementById("commande").hidden = true;
    }

    document.getElementById("cart-count").textContent = count;
    const shipping = cart.length ? deliveryFee : 0;
    document.getElementById("cart-subtotal").textContent = formatPrice(total);
    document.getElementById("cart-shipping").textContent = formatPrice(shipping);
    document.getElementById("cart-total").textContent = formatPrice(total + shipping);
    document.getElementById("checkout-button").disabled = cart.length === 0;
    document.getElementById("order-message").textContent = "";
}

productList.addEventListener("click", event => {
    if (event.target.closest("[data-reset]")) {
        searchInput.value = "";
        document.querySelector('[data-category="Tous"]').click();
        searchInput.focus();
        return;
    }
    const button = event.target.closest("[data-add]");

    if (!button) return;

    const id = Number(button.dataset.add);
    const product = products.find(item => item.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();
    showFeedback(`${product.name} ajouté · Tzed lel panier !`);
});

document.getElementById("cart-items").addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-quantity]");
    if (quantityButton) {
        const item = cart.find(product => product.id === Number(quantityButton.dataset.quantity));
        item.quantity += Number(quantityButton.dataset.change);
        if (!item.quantity) cart = cart.filter(product => product.id !== item.id);
        renderCart();
        const replacement = document.querySelector(`[data-quantity="${item.id}"][data-change="${quantityButton.dataset.change}"]`);
        (replacement || document.getElementById("cart-button")).focus({ preventScroll: true });
        showFeedback("Panier mis à jour");
        return;
    }
    const button = event.target.closest("[data-remove]");

    if (!button) return;

    const id = Number(button.dataset.remove);

    cart = cart.filter(item => item.id !== id);

    renderCart();
    document.getElementById("cart-button").focus({ preventScroll: true });
    showFeedback("Article retiré du panier");
});

searchInput.addEventListener("input", renderProducts);
sortInput.addEventListener("change", renderProducts);

document.querySelector(".filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    document.querySelectorAll(".filter").forEach(item => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    renderProducts();
});

document.getElementById("cart-button").addEventListener("click", () => {
    scrollToSection(document.getElementById("panier"));
});

document.getElementById("checkout-button").addEventListener("click", () => {
    if (cart.length === 0) {
        showFeedback("Ajoutez un article pour préparer votre commande.");
        return;
    }

    const section = document.getElementById("commande");
    section.hidden = false;
    scrollToSection(section);
    document.querySelector('[name="name"]').focus({ preventScroll: true });
});

renderProducts();
renderCart();
const orderForm = document.getElementById("order-form");

orderForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (cart.length === 0) {
        showFeedback("Ajoutez un article pour préparer votre commande.");
        return;
    }

    if (!orderForm.reportValidity()) return;

    const formData = new FormData(orderForm);

    const name = formData.get("name").trim();
    const phone = formData.get("phone").trim();
    const address = formData.get("address").trim();
    const city = formData.get("city").trim();

    if (![name, phone, address, city].every(Boolean)) {
        document.getElementById("order-message").textContent = "Veuillez compléter chaque champ avec vos coordonnées.";
        return;
    }

    let message = "*DEMANDE DE COMMANDE - ZM BEAUTY FRANCE*\nAslema, nheb ncommandi :\n\n";

    message += "👤 Nom : " + name + "\n";
    message += "📞 Téléphone : " + phone + "\n";
    message += "📍 Adresse : " + address + "\n";
    message += "🏙️ Ville : " + city + "\n\n";

    message += "🛍️ *Produits commandés :*\n";

    cart.forEach(function(item) {
        message += "- " + item.name +
            " x " + item.quantity +
            " = " + formatPrice(item.price * item.quantity) + "\n";
    });

    const total = getSubtotal();
    message += "\nSous-total : " + formatPrice(total);
    message += "\nLivraison : " + formatPrice(deliveryFee);
    message += "\nTotal à payer : " + formatPrice(total + deliveryFee);
    message += "\nPaiement à la livraison\nMerci de confirmer la disponibilité et les modalités de livraison.";

    const whatsappNumber = "21650689730";

    const whatsappURL =
        "https://wa.me/" + whatsappNumber +
        "?text=" + encodeURIComponent(message);

    document.getElementById("order-message").textContent = "Votre message est prêt. Envoyez-le dans WhatsApp pour transmettre votre demande à la boutique.";
    window.open(whatsappURL, "_blank", "noopener,noreferrer");
    const fallback = document.createElement("a");
    fallback.href = whatsappURL;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = " Ouvrir WhatsApp si la fenêtre ne s’affiche pas ↗";
    document.getElementById("order-message").appendChild(fallback);
});

const requestForm = document.getElementById("request-form");
const photoInput = document.getElementById("request-photo");
const photoPreview = document.getElementById("photo-preview");
const photoStatus = document.getElementById("photo-status");
const requestStatus = document.getElementById("request-status");
const requestSubmit = document.getElementById("request-submit");
let previewUrl;

function validatePhoto() {
    const photo = photoInput.files[0];
    let error = "";
    if (photo && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
        error = "Choisissez une photo JPG, PNG ou WebP · Hot taswira bel format s7i7.";
    } else if (photo && photo.size > 7 * 1024 * 1024) {
        error = "Photo trop grande · Taswira lezem a9al men 7 Mo.";
    } else if (photo && !photo.size) {
        error = "Cette photo est vide · Ekhtar taswira okhra.";
    }
    photoInput.setCustomValidity(error);
    photoStatus.textContent = error || (photo ? `${photo.name} · Photo prête à envoyer` : "");
    return Boolean(photo) && !error;
}

photoInput.addEventListener("change", () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = undefined;
    photoPreview.hidden = true;
    photoPreview.removeAttribute("src");
    requestStatus.textContent = "";
    if (validatePhoto()) {
        previewUrl = URL.createObjectURL(photoInput.files[0]);
        photoPreview.src = previewUrl;
        photoPreview.hidden = false;
    }
});

requestForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (requestSubmit.disabled) return;
    const validPhoto = validatePhoto();
    if (!requestForm.reportValidity() || !validPhoto) return;
    const formData = new FormData(requestForm);
    const customerName = String(formData.get("customer-name")).trim();
    const phone = String(formData.get("phone")).trim();
    if (!customerName || !phone) {
        requestStatus.textContent = "Hot esmek w noumrouk · Complétez votre nom et téléphone.";
        return;
    }
    formData.set("customer-name", customerName);
    formData.set("phone", phone);
    requestSubmit.disabled = true;
    requestSubmit.textContent = "Envoi en cours · Naba3thou…";
    requestForm.setAttribute("aria-busy", "true");
    requestStatus.textContent = "Gardez cette page ouverte pendant l’envoi de la photo.";
    try {
        const response = await fetch("/", { method: "POST", body: formData });
        if (!response.ok) throw new Error("Submission failed");
        requestStatus.textContent = "Demande envoyée · Wosletna taswirtek ! Nraj3oulek bel prix w el disponibilité au numéro indiqué.";
        requestForm.reset();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = undefined;
        photoPreview.hidden = true;
        photoPreview.removeAttribute("src");
        photoStatus.textContent = "";
        photoInput.setCustomValidity("");
    } catch {
        requestStatus.textContent = "L’envoi n’a pas pu être confirmé · Thabet mel connexion. Votre photo reste sélectionnée : réessayez ou contactez-nous sur WhatsApp en joignant la photo.";
    } finally {
        requestSubmit.disabled = false;
        requestSubmit.textContent = "Envoyer ma demande · Ab3ath ↗";
        requestForm.removeAttribute("aria-busy");
    }
});