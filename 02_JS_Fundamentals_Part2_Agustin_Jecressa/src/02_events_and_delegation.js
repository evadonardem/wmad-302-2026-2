export function initSariSariPOS() {
  const posContainer = document.getElementById('pos-register');
  const billTotalEl = document.getElementById('bill-total');
  let currentTotal = 0;

  if (!posContainer) return;

  // Single-listener event delegation
  posContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { action, price } = btn.dataset;

    if (action === 'clear') {
      currentTotal = 0;
    } else {
  
      let itemPrice = parseFloat(price);

      if (isNaN(itemPrice)) {
        const match = btn.textContent.match(/\d+/);
        itemPrice = match ? parseFloat(match[0]) : 0;
      }

      currentTotal += itemPrice;
    }

    if (billTotalEl) {
      billTotalEl.textContent = `₱${currentTotal.toFixed(2)}`;
    }

  });
}