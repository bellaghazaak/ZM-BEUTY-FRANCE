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
        price: 300.90,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
    },
    {
        id: 6,
        name: "Collection Mode",
        category: "Vêtements",
        price: 44.90,
        image: "images/sac-rose.jpg.jpg"
    }
];

let cart = JSON.parse(localStorage.getItem("zmCart") || "[]");
let selectedCategory = "Tous";

const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search");

function formatPrice(price) {
    return price.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR"
    });
}

function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        const matchesCategory =
            selectedCategory === "Tous" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    productList.innerHTML = "";

    if (filtered.length === 0) {
        productList.innerHTML = "<p>Aucun produit trouvé.</p>";
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <img class="product-image"
                 src="${product.image}"
                 alt="${product.name}"
                 loading="lazy">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="price">${formatPrice(product.price)}</p>
            <button data-add="${product.id}">
                Ajouter au panier
            </button>
        `;

        productList.appendChild(card);
    });
}

function saveCart() {
    localStorage.setItem("zmCart", JSON.stringify(cart));
}

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);

    const count = cart.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = formatPrice(total);

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.textContent = "Votre panier est vide.";
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-row";

        row.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${formatPrice(item.price)} × ${item.quantity}
            </div>
            <div>
                <button data-minus="${item.id}">−</button>
                <button data-plus="${item.id}">+</button>
                <button data-remove="${item.id}">Supprimer</button>
            </div>
        `;

        cartItems.appendChild(row);
    });
}

productList.addEventListener("click", event => {
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

    saveCart();
    renderCart();

    button.textContent = "Ajouté ✓";
    setTimeout(() => {
        button.textContent = "Ajouter au panier";
    }, 1000);
});

document.getElementById("cart-items").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(
        button.dataset.plus ||
        button.dataset.minus ||
        button.dataset.remove
    );

    const item = cart.find(product => product.id === id);
    if (!item) return;

    if (button.hasAttribute("data-plus")) {
        item.quantity++;
    } else if (button.hasAttribute("data-minus")) {
        item.quantity--;
        if (item.quantity <= 0) {
            cart = cart.filter(product => product.id !== id);
        }
    } else {
        cart = cart.filter(product => product.id !== id);
    }

    saveCart();
    renderCart();
});

searchInput.addEventListener("input", renderProducts);

document.querySelector(".filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    selectedCategory = button.dataset.category;

    document.querySelectorAll(".filter").forEach(filter => {
        filter.classList.toggle("active", filter === button);
    });

    renderProducts();
});

document.getElementById("cart-button").addEventListener("click", () => {
    document.getElementById("panier").scrollIntoView({
        behavior: "smooth"
    });
});

document.getElementById("checkout-button").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

    const orderSection = document.getElementById("commande");
    orderSection.hidden = false;
    orderSection.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("order-form").addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

    const formData = new FormData(event.target);

    const order = {
        customer: {
            name: formData.get("name"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            city: formData.get("city")
        },
        products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        ),
        payment: "Paiement à la livraison"
    };

    /*
      Démo locale uniquement :
      la commande n'est pas envoyée à la boutique.
      Il faudra connecter un service de commandes pour la recevoir.
    */

    document.getElementById("order-message").textContent =
        "Le formulaire fonctionne, mais la commande n'a pas encore été envoyée. " +
        "La boutique doit être connectée à un service de réception des commandes.";

    console.log("Commande de démonstration :", order);
});


renderProducts();
renderCart();
const orderForm = document.getElementById("order-form");

orderForm.addEventListener("submit", function(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const formData = new FormData(orderForm);

    const name = formData.get("name");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const city = formData.get("city");

    let message = "🌸 *NOUVELLE COMMANDE - Z&M BEAUTY FRANCE* 🌸\n\n";

    message += "👤 Nom : " + name + "\n";
    message += "📞 Téléphone : " + phone + "\n";
    message += "📍 Adresse : " + address + "\n";
    message += "🏙️ Ville : " + city + "\n\n";

    message += "🛍️ *Produits commandés :*\n";

    cart.forEach(function(item) {
        message += "- " + item.name +
            " x " + item.quantity +
            " = " + (item.price * item.quantity).toFixed(2) +
            " €\n";
    });

    const total = cart.reduce(function(sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    message += "\n💰 Total : " + total.toFixed(2) + " €";
   const fraisLivraison = 8;
const totalAvecLivraison = total + fraisLivraison;

message += "\n📦 Livraison : " + fraisLivraison.toFixed(2) + " DT";
message += "\n💰 Total à payer : " + totalAvecLivraison.toFixed(2) + " DT";
message += "\n💵 Paiement à la livraison";

    const whatsappNumber = "21650689730";

    const whatsappURL =
        "https://wa.me/" + whatsappNumber +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
});