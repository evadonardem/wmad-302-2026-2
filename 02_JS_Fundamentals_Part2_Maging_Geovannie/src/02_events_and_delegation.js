export function initSariSariPOS() {
  const posContainer = document.getElementById('pos-register');
  const billTotalEl = document.getElementById('bill-total');
  let currentTotal = 0;

  if (!posContainer) return;

  // Single-listener event delegation
  posContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    switch (btn.dataset.action) {
      case 'add':
        currentTotal += parseFloat(btn.dataset.price);
        break;
      case 'clear':
        currentTotal = 0;
        break;
    }

    billTotalEl.textContent = `₱${currentTotal.toFixed(2)}`;
  });
}