const posRegister = document.querySelector('#pos-register');
const billTotalEl = document.querySelector('#bill-total');

let runningTotal = 0;

if (posRegister) {
  posRegister.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;

    if (action === 'add') {
      const amount = Number(button.dataset.amount) || 0;
      runningTotal += amount;
    } else if (action === 'clear') {
      runningTotal = 0;
    }

    if (billTotalEl) {
      billTotalEl.textContent = `₱${runningTotal.toFixed(2)}`;
    }
  });
}