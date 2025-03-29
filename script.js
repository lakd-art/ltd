/**************************************************
 * Données : Produits vendus au LTD Little Seoul
 **************************************************/
const productsLTD = [
  // Nourriture
  { category: "Nourriture", name: "Gaufre", minPrice: 10, maxPrice: 14 },
  { category: "Nourriture", name: "Barre chocolatée", minPrice: 10, maxPrice: 14 },
  { category: "Nourriture", name: "Bonbons", minPrice: 6, maxPrice: 10 },
  { category: "Nourriture", name: "Yaourts", minPrice: 2, maxPrice: 5 },
  { category: "Nourriture", name: "Cookie", minPrice: 2, maxPrice: 5 },
  // Boissons
  { category: "Boissons", name: "Bouteille d'eau", minPrice: 5, maxPrice: 10 },
  { category: "Boissons", name: "Cola", minPrice: 6, maxPrice: 10 },
  { category: "Boissons", name: "Café", minPrice: 10, maxPrice: 14 },
  { category: "Boissons", name: "Sprite", minPrice: 6, maxPrice: 10 },
  { category: "Boissons", name: "Boisson énergisante", minPrice: 6, maxPrice: 10 },
  { category: "Boissons", name: "Bière", minPrice: 6, maxPrice: 10 },
  { category: "Boissons", name: "Champagne", minPrice: 60, maxPrice: 120 },
  { category: "Boissons", name: "Pastis", minPrice: 16, maxPrice: 25 },
  { category: "Boissons", name: "Rhum", minPrice: 16, maxPrice: 25 },
  { category: "Boissons", name: "Whisky", minPrice: 16, maxPrice: 25 },
  // Objets
  { category: "Objets", name: "Canne à pêche", minPrice: 250, maxPrice: 300 },
  { category: "Objets", name: "Hameçon", minPrice: 5, maxPrice: 10 },
  { category: "Objets", name: "Tablette", minPrice: 250, maxPrice: 300 },
  { category: "Objets", name: "Téléphone", minPrice: 90, maxPrice: 150 },
  { category: "Objets", name: "Radio", minPrice: 300, maxPrice: 500 }
];

/**************************************************
 * Couleurs dynamiques pour le contour des cartes
 **************************************************/
const categoryBorderColors = {
  "Nourriture": "border-yellow-500",
  "Boissons": "border-blue-500",
  "Objets": "border-purple-500"
};

/**************************************************
 * Variables globales
 **************************************************/
const selections = {}; // Stocke la quantité et l'option de prix pour chaque produit

/**************************************************
 * INITIALISATION
 **************************************************/
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateTotal();

  // Recherche dynamique améliorée
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderProducts(e.target.value);
    });
  }

  // Boutons d'action
  document.getElementById("facture-btn").addEventListener("click", generatePDF);
  document.getElementById("clear-btn").addEventListener("click", clearSelections);
});

/**************************************************
 * Rendu du catalogue des produits
 * La fonction filtre la liste des produits selon la query.
 **************************************************/
function renderProducts(filterQuery = "") {
  const catalogue = document.getElementById("catalogue");
  catalogue.innerHTML = "";

  const normalizedQuery = filterQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const tokens = normalizedQuery.split(/\s+/).filter(token => token.length > 0);

  const filteredProducts = productsLTD.filter(prod => {
    const normalizedName = prod.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedCategory = prod.category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return tokens.every(token => normalizedName.includes(token) || normalizedCategory.includes(token));
  });

  filteredProducts.forEach((prod, index) => {
    const card = createProductCard(prod, index);
    catalogue.appendChild(card);
  });
}

/**************************************************
 * Création d'une carte produit
 * Affiche le nom, les options de prix et le contrôle de quantité.
 **************************************************/
function createProductCard(product, index) {
  const borderColorClass = categoryBorderColors[product.category] || "border-gray-200";
  const card = document.createElement("div");
  card.className = `group relative h-full border-2 ${borderColorClass} rounded-2xl overflow-hidden transition transform duration-300 hover:shadow-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800`;
  card.style.opacity = "0";
  setTimeout(() => { card.style.opacity = "1"; }, 50);

  const innerCard = document.createElement("div");
  innerCard.className = "p-4 flex flex-col justify-between h-full";

  // En-tête avec le nom du produit
  const header = document.createElement("div");
  header.className = "mb-3 border-b border-gray-300 dark:border-gray-600 pb-2";
  const title = document.createElement("h3");
  title.textContent = product.name;
  title.className = "text-xl font-bold text-gray-800 dark:text-gray-100";
  header.appendChild(title);
  innerCard.appendChild(header);

  // Informations de prix
  const priceInfo = document.createElement("p");
  priceInfo.textContent = `Promo: ${product.minPrice}$ | Standard: ${product.maxPrice}$`;
  priceInfo.className = "text-sm text-gray-600 dark:text-gray-400 mb-4";
  innerCard.appendChild(priceInfo);

  // Options de sélection de prix
  const priceOptions = document.createElement("div");
  priceOptions.className = "flex gap-2 mb-4";
  const btnMin = document.createElement("button");
  btnMin.textContent = "Promo";
  btnMin.className = "flex-1 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition";
  btnMin.addEventListener("click", () => setPriceOption(index, "min", btnMin, btnMax));
  const btnMax = document.createElement("button");
  btnMax.textContent = "Standard";
  btnMax.className = "flex-1 py-1 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded transition";
  btnMax.addEventListener("click", () => setPriceOption(index, "max", btnMax, btnMin));
  priceOptions.append(btnMin, btnMax);
  innerCard.appendChild(priceOptions);

  // Contrôle de la quantité
  const quantityControls = document.createElement("div");
  quantityControls.className = "flex items-center gap-2";
  const btnMinus = document.createElement("button");
  btnMinus.textContent = "−";
  btnMinus.className = "w-10 h-10 flex items-center justify-center bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded transition";
  btnMinus.addEventListener("click", () => changeQuantity(index, -1));
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "0";
  qtyInput.value = "0";
  qtyInput.setAttribute("data-prod-index", index);
  qtyInput.className = "w-16 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded";
  qtyInput.addEventListener("input", (e) => {
    const val = parseInt(e.target.value) || 0;
    selections[index] = { ...selections[index], quantity: val };
    updateTotal();
  });
  const btnPlus = document.createElement("button");
  btnPlus.textContent = "+";
  btnPlus.className = "w-10 h-10 flex items-center justify-center bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded transition";
  btnPlus.addEventListener("click", () => changeQuantity(index, 1));
  quantityControls.append(btnMinus, qtyInput, btnPlus);
  innerCard.appendChild(quantityControls);

  card.appendChild(innerCard);

  if (!selections[index]) {
    selections[index] = { quantity: 0, priceOption: "max" };
  }
  return card;
}

/**************************************************
 * Gestion des options de prix
 **************************************************/
function setPriceOption(prodIndex, option, selectedBtn, otherBtn) {
  selections[prodIndex].priceOption = option;
  selectedBtn.classList.add("ring-2", "ring-offset-2", "ring-blue-400");
  otherBtn.classList.remove("ring-2", "ring-offset-2", "ring-blue-400");
  updateTotal();
}

/**************************************************
 * Modification de la quantité
 **************************************************/
function changeQuantity(prodIndex, delta) {
  if (!selections[prodIndex]) {
    selections[prodIndex] = { quantity: 0, priceOption: "max" };
  }
  selections[prodIndex].quantity = Math.max(0, selections[prodIndex].quantity + delta);
  const qtyInput = document.querySelector(`input[data-prod-index="${prodIndex}"]`);
  if (qtyInput) {
    qtyInput.value = selections[prodIndex].quantity;
  }
  updateTotal();
}

/**************************************************
 * Mise à jour interactive du panneau récapitulatif
 **************************************************/
function updateTotal() {
  let total = 0;
  let detailsHTML = `<div class="space-y-2">`;
  Object.keys(selections).forEach(index => {
    const sel = selections[index];
    if (sel.quantity > 0) {
      const prod = productsLTD[index];
      const unitPrice = (sel.priceOption === "min") ? prod.minPrice : prod.maxPrice;
      const lineTotal = unitPrice * sel.quantity;
      total += lineTotal;
      detailsHTML += `<div class="flex items-center justify-between bg-gray-700 p-2 rounded">
        <div class="w-1/2 text-sm font-bold text-white">${prod.name}</div>
        <div class="w-1/4 text-xs text-gray-300">${sel.quantity} x ${unitPrice}$</div>
        <div class="w-1/4 text-sm font-semibold text-white">${lineTotal}$</div>
        <div class="flex items-center gap-1">
          <button onclick="changeQuantity(${index}, -1)" class="text-red-300 hover:text-red-500">−</button>
          <button onclick="changeQuantity(${index}, 1)" class="text-green-300 hover:text-green-500">+</button>
          <button onclick="removeItem(${index})" class="text-gray-300 hover:text-gray-500">✕</button>
        </div>
      </div>`;
    }
  });
  detailsHTML += `</div>`;
  document.getElementById("total-facture").textContent = `Total : ${total} $`;
  const invoiceDetailsElem = document.getElementById("invoice-details");
  if (invoiceDetailsElem) {
    invoiceDetailsElem.innerHTML = detailsHTML;
  }
}

/**************************************************
 * Suppression d'un article du récapitulatif
 **************************************************/
function removeItem(prodIndex) {
  if (selections[prodIndex]) {
    selections[prodIndex].quantity = 0;
    updateTotal();
    renderProducts();
  }
}

/**************************************************
 * Réinitialisation de toutes les sélections
 **************************************************/
function clearSelections() {
  Object.keys(selections).forEach(index => {
    selections[index].quantity = 0;
    selections[index].priceOption = "max";
  });
  renderProducts();
  updateTotal();
}

/**************************************************
 * Génération de la facture en PDF
 * Intègre le logo, les informations de l'entreprise, le vendeur et un tableau récapitulatif.
 **************************************************/
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = margin;

  // Chaîne en base64 du logo mise à jour
  const logoData = "data:image/jpeg;base64,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";

  // Informations de l'entreprise
  const companyInfo = {
    name: "LTD",
    address: "Little Seoul, Los santos",
    telephone: "(480) 912-9904",
    email: "contact@ltdlittleseoul.com",
    siret: "007 000 069"
  };

  // En-tête : Nom de l'entreprise et informations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(companyInfo.name, margin, currentY);

  // Ajout du logo en haut à droite
  doc.addImage(logoData, 'JPEG', pageWidth - margin - 40, margin, 30, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  currentY += 8;
  doc.text(companyInfo.address, margin, currentY);
  currentY += 5;
  doc.text("Téléphone : " + companyInfo.telephone, margin, currentY);
  currentY += 5;
  doc.text("Email : " + companyInfo.email, margin, currentY);
  currentY += 5;
  doc.text("SIRET : " + companyInfo.siret, margin, currentY);

  // Ajout du nom du vendeur
  currentY += 5;
  doc.text("Vendeur : Pakkat", margin, currentY);

  // Affichage de la date à droite
  const currentDate = new Date().toLocaleDateString();
  doc.text("Date : " + currentDate, pageWidth - margin - 40, margin + 35);

  currentY += 10;
  // Séparateur
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Titre de la facture
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Facture", margin, currentY);
  currentY += 10;

  // Préparation des données du tableau récapitulatif
  const tableData = [];
  let grandTotal = 0;
  Object.keys(selections).forEach(index => {
    const sel = selections[index];
    if (sel.quantity > 0) {
      const prod = productsLTD[index];
      const unitPrice = (sel.priceOption === "min") ? prod.minPrice : prod.maxPrice;
      const lineTotal = unitPrice * sel.quantity;
      grandTotal += lineTotal;
      tableData.push([prod.name, sel.quantity.toString(), unitPrice + " $", lineTotal + " $"]);
    }
  });

  if (tableData.length > 0) {
    // Affichage du tableau avec autoTable en thème "striped"
    doc.autoTable({
      startY: currentY,
      head: [['Nom', 'Quantité', 'Prix unitaire', 'Prix total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [50, 50, 50], textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'center' },
      styles: { fontSize: 10, cellPadding: 4 },
      margin: { left: margin, right: margin }
    });
    currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total général : " + grandTotal + " $", margin, currentY);
  } else {
    doc.setFontSize(12);
    doc.text("Aucun article sélectionné.", margin, currentY);
  }

  // Pied de page : numérotation des pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text("Page " + i + " sur " + pageCount, pageWidth - margin - 30, doc.internal.pageSize.getHeight() - 10);
  }

  // Enregistrement du PDF
  doc.save("facture_complete_LTD_little_seoul.pdf");
}
