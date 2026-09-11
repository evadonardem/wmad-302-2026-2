export function initSariSariPOS() {
  const posContainer = document.getElementById('pos-register');
  const billTotalEl = document.getElementById('bill-total');
  let currentTotal = 0;

  if (!posContainer) return;

  // Single-listener event delegation
  posContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    // TODO:
    // 1. Read btn.dataset.action ('add' or 'clear')
    if (action === 'add') {
      currentTotal += Number(btn.dataset.amount);
    }
    // 2. Update currentTotal state
    if (action === 'clear') {
      currentTotal = 0;
    }
    // 3. Update billTotalEl textContent formatted as ₱XX.XX
    billTotalEl.textContent = `₱${currentTotal.toFixed(2)}`;
  });
}