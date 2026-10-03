export function initSariSariPOS() {
  const posContainer = document.getElementById('pos-register');
  const billTotalEl = document.getElementById('bill-total');
  let currentTotal = 0;

  if (!posContainer) return;

  // Single-listener event delegation
  posContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // 1. Read action and price from dataset
    const action = btn.dataset.action;
    const price = parseFloat(btn.dataset.price) || 0;

    // 2. Update currentTotal state
    if (action === 'add') {
      currentTotal += price;
    } else if (action === 'clear') {
      currentTotal = 0;
    }

    // Prevent negative balances
    currentTotal = Math.max(0, currentTotal);

    // 3. Update billTotalEl textContent formatted as ₱XX.XX
    if (billTotalEl) {
      billTotalEl.textContent = `₱${currentTotal.toFixed(2)}`;
    }
  });
}