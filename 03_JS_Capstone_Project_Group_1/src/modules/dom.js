export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function renderResidentCards(container, residents) {
  if (!residents || residents.length === 0) {
    container.innerHTML = `<p class="empty-state">No residents registered yet.</p>`;
    return;
  }

  container.innerHTML = residents
    .map(resident => {
      const priority = resident.priority || 'LOW';

      return `
        <div class="resident-card" data-priority="${priority}">
          <p class="resident-card-name">
            ${sanitizeHTML(resident.name)}
            <span class="badge ${priority.toLowerCase()}">${priority}</span>
          </p>
          <p class="resident-card-purok">${sanitizeHTML(resident.city || resident.province || '')}</p>
          <button data-action="remove-resident" data-id="${resident.id}">Remove</button>
        </div>
      `;
    })
    .join('');
}

export function renderPOSRegister(container, packerState) {
  const { items = [], subtotal = 0, budgetCap = 0 } = packerState;
  const percentUsed = budgetCap > 0 ? Math.min((subtotal / budgetCap) * 100, 100) : 0;

  const itemsHTML = items.length
    ? items
        .map((item, index) => `
          <li class="pos-item">
            <span>${sanitizeHTML(item.name)}</span>
            <span>₱${Number(item.price).toFixed(2)}</span>
            <button data-action="remove-item" data-id="${item.id ?? index}">✕</button>
          </li>
        `)
        .join('')
    : `<li class="pos-item-empty">No items added yet.</li>`;

  container.innerHTML = `
    <div class="pos-summary">
      <p>Subtotal: ₱${subtotal.toFixed(2)}</p>
      <p>Budget Cap: ₱${budgetCap.toFixed(2)}</p>
      <progress value="${subtotal}" max="${budgetCap}"></progress>
      <span>${percentUsed.toFixed(0)}% used</span>
    </div>
    <ul class="pos-item-list">
      ${itemsHTML}
    </ul>
  `;
}

export function setupActionDelegation(rootElement, actionMap) {
  rootElement.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target || !rootElement.contains(target)) return;

    const action = target.dataset.action;
    const handler = actionMap[action];

    if (typeof handler === 'function') {
      handler(target.dataset, target, e);
    }
  });
}