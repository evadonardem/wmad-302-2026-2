/**
 * [ROLE B] DOM & UI Module - Student Starter Template
 */

export function sanitizeHTML(str) {
  const value = String(str ?? '');
  const temp = document.createElement('div');
  temp.textContent = value;
  return temp.innerHTML;
}

export function renderResidentCards(container, residents) {
  if (!container) return;

  const queue = Array.isArray(residents) ? residents : [];

  if (!queue.length) {
    container.innerHTML = '<div class="empty-state">No residents in queue.</div>';
    return;
  }

  container.innerHTML = queue
    .map((resident) => {
      const priority = sanitizeHTML(String(resident.priority ?? 'LOW'));
      const name = sanitizeHTML(resident.name ?? 'Unknown Resident');
      const city = sanitizeHTML(resident.city ?? 'N/A');
      const score = Number(resident.score ?? 0);
      const id = sanitizeHTML(String(resident.id ?? ''));

      return `
        <article class="resident-card" data-priority="${priority}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
            <h3>${name}</h3>
            <span class="badge ${priority.toLowerCase()}">${priority}</span>
          </div>
          <p><strong>Location:</strong> ${city}</p>
          <p><strong>Income:</strong> ₱${Number(resident.monthlyIncome ?? 0).toLocaleString()}</p>
          <p><strong>Dependents:</strong> ${Number(resident.dependentCount ?? 0)}</p>
          <p><strong>Score:</strong> ${score}</p>
          <button type="button" class="btn" data-action="remove-resident" data-id="${id}" style="width:auto; margin-top:0.5rem;">
            Remove
          </button>
        </article>
      `;
    })
    .join('');
}

export function renderPOSRegister(container, packerState) {
  if (!container) return;

  const items = typeof packerState?.getItems === 'function' ? packerState.getItems() : [];
  const total = typeof packerState?.getTotal === 'function' ? packerState.getTotal() : 0;
  const budgetCap = typeof packerState?.getBudgetCap === 'function' ? packerState.getBudgetCap() : 0;
  const remaining = Math.max(budgetCap - total, 0);
  const progressValue = budgetCap > 0 ? Math.min((total / budgetCap) * 100, 100) : 0;

  const itemMarkup = items.length
    ? items
        .map(
          (item, index) => `
            <li style="display:flex; justify-content:space-between; gap:0.5rem; align-items:center; margin-bottom:0.5rem;">
              <span>${sanitizeHTML(item.name ?? 'Item')}</span>
              <span style="display:flex; align-items:center; gap:0.5rem;">
                <strong>₱${Number(item.price ?? 0).toLocaleString()}</strong>
                <button type="button" class="btn" data-action="remove-item" data-index="${index}" style="width:auto; padding:0.35rem 0.75rem;">Remove</button>
              </span>
            </li>`
        )
        .join('')
    : '<li class="empty-state">No items added yet.</li>';

  container.innerHTML = `
    <div class="pos-register">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <strong>Subtotal:</strong>
        <span>₱${total.toLocaleString()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <strong>Budget Cap:</strong>
        <span>₱${budgetCap.toLocaleString()}</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <strong>Remaining:</strong>
        <span>₱${remaining.toLocaleString()}</span>
      </div>
      <progress value="${progressValue}" max="100" style="width:100%;"></progress>
      <ul style="list-style:none; padding:0; margin:1rem 0 0;">
        ${itemMarkup}
      </ul>
    </div>
  `;
}

export function setupActionDelegation(rootElement, actionMap) {
  if (!rootElement || typeof actionMap !== 'object') return;

  rootElement.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const handler = actionMap[action];

    if (typeof handler === 'function') {
      handler(event, target);
    }
  });
}