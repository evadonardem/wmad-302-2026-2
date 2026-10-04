export function initSariSariPOS() {
  const posContainer = document.getElementById('pos-register');
  const billTotalEl = document.getElementById('bill-total');
  let currentTotal = 0;

  if (!posContainer) return;

  const render = () => {
    // 3. Update billTotalEl textContent formatted as ₱XX.XX
    if (billTotalEl) billTotalEl.textContent = `₱${currentTotal.toFixed(2)}`;
  };

  // Single-listener event delegation
  posContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    // TODO:
    // 1. Read btn.dataset.action ('add' or 'clear')
    const action = btn.dataset.action;

    // 2. Update currentTotal state
    if (action === 'add') {
      const price = Number(btn.dataset.price);
      if (!Number.isFinite(price) || price < 0) return;
      currentTotal = Number((currentTotal + price).toFixed(2));
    } else if (action === 'clear') {
      currentTotal = 0;
    } else {
      return; // unknown action: do nothing
    }

    render();
  });
}