/**
 * [ROLE B] DOM & UI Module - Student Starter Template
 */

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

  container.innerHTML = residents.map(resident => `
    <div class="resident-card" data-id="${resident.id}">
      <h4>${sanitizeHTML(resident.fullName)}</h4>
      <p>${sanitizeHTML(resident.province)}, ${sanitizeHTML(resident.city)}</p>
      <p>Priority: <strong>${sanitizeHTML(resident.priority)}</strong> (Score: ${resident.score})</p>
      <p>Status: ${resident.approved ? 'Approved' : 'Not Approved'}</p>
      <button data-action="remove-resident" data-id="${resident.id}">Remove</button>
    </div>
  `).join('');
}

export function renderPOSRegister(container, packerState) {
  const { items = [], budgetCap = 0 } = packerState;
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const remaining = budgetCap - subtotal;
  const percentUsed = budgetCap > 0 ? Math.min((subtotal / budgetCap) * 100, 100) : 0;
  const overBudget = subtotal > budgetCap;
  const budgetReached = remaining <= 0;

  container.innerHTML = `
    <div class="pos-summary">
      <p>Subtotal: ₱${subtotal.toFixed(2)} / ₱${budgetCap.toFixed(2)}</p>
      <p style="font-size: 0.85rem; color: ${budgetReached ? 'var(--critical-color)' : 'var(--text-muted)'};">
        ${budgetReached ? 'Budget cap reached' : `Remaining: ₱${remaining.toFixed(2)}`}
      </p>
      <progress value="${percentUsed}" max="100" class="${overBudget ? 'over-budget' : ''}"></progress>
    </div>
    <ul class="pos-item-list">
      ${items.map((item, index) => `
        <li data-id="${item.id}">
          <span>${sanitizeHTML(item.name)}</span>
          <span>₱${item.price.toFixed(2)}</span>
          <button data-action="remove-item" data-id="${item.id}" data-index="${index}">Remove</button>
        </li>
      `).join('')}
    </ul>
  `;
}

export function renderReliefCatalog(container, catalog, packer) {
  const remaining = packer.getBudgetCap() - packer.getTotal();

  container.innerHTML = catalog.map(item => {
    const disabled = item.price > remaining;
    return `
      <button
        type="button"
        class="catalog-item ${disabled ? 'disabled' : ''}"
        data-action="add-catalog-item"
        data-id="${item.id}"
        ${disabled ? 'disabled' : ''}
      >
        <span class="catalog-item-name">${sanitizeHTML(item.name)}</span>
        <span class="catalog-item-price">₱${item.price.toFixed(2)}</span>
      </button>
    `;
  }).join('');
}

export function setupActionDelegation(rootElement, actionMap) {
  rootElement.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const handler = actionMap[action];

    if (typeof handler === 'function') {
      handler(target.dataset, event);
    } else {
      console.warn(`No handler registered for action: "${action}"`);
    }
  });
}