/**
 * [ROLE B] DOM & UI Module
 * e-Barangay — Resident Queue & POS Register rendering
 */

/**
 * Escapes a string for safe insertion into innerHTML, preventing XSS.
 * Uses the browser's own text-node encoding rather than a manual
 * blocklist, so it's safe against every HTML-special character.
 */
export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Renders resident queue cards into `container`.
 * Each card carries a real `data-priority="${resident.priority}"` attribute
 * (used by CSS for the color-coded accent bar) and a delete button wired
 * for event delegation via `data-action="remove-resident"` + `data-id`.
 */
export function renderResidentCards(container, residents) {
  if (!container) return;

  if (!residents || residents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon" aria-hidden="true">🏘️</div>
        <p>No residents in the queue right now.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = residents.map((resident) => {
    const id = sanitizeHTML(String(resident.id ?? ''));
    const name = sanitizeHTML(resident.name ?? 'Unknown resident');
    const priority = sanitizeHTML(String(resident.priority ?? 'low').toLowerCase());
    const need = sanitizeHTML(resident.need ?? resident.concern ?? '');
    const initial = sanitizeHTML((resident.name ?? '?').trim().charAt(0).toUpperCase() || '?');
    const waitMinutes = resident.waitMinutes;
    const waitLabel = (waitMinutes !== undefined && waitMinutes !== null)
      ? `${sanitizeHTML(String(waitMinutes))} min wait`
      : '';

    return `
      <article class="resident-card" data-priority="${priority}" data-id="${id}">
        <div class="resident-card__avatar" aria-hidden="true">${initial}</div>
        <div class="resident-card__body">
          <div class="resident-card__top">
            <h3 class="resident-card__name">${name}</h3>
            <span class="badge ${priority}">${priority}</span>
          </div>
          ${need ? `<p class="resident-card__need">${need}</p>` : ''}
          ${waitLabel ? `<p class="resident-card__wait"><span aria-hidden="true">⏱</span> ${waitLabel}</p>` : ''}
        </div>
        <button
          type="button"
          class="icon-btn icon-btn--danger"
          data-action="remove-resident"
          data-id="${id}"
          aria-label="Remove ${name} from the queue"
        >✕</button>
      </article>
    `;
  }).join('');
}

/**
 * Renders the POS register: item list, subtotal, budget cap and a
 * live `<progress>` bar showing how much of the budget has been used.
 * Expects `packerState` shaped roughly as:
 *   { items: [{ id, name, price, qty }], budgetCap: number }
 */
export function renderPOSRegister(container, packerState) {
  if (!container) return;

  const items = Array.isArray(packerState?.items) ? packerState.items : [];
  const budgetCap = Number(packerState?.budgetCap) || 0;
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    return sum + price * qty;
  }, 0);
  const remaining = budgetCap - subtotal;
  const isOverBudget = remaining < 0;
  const percentUsed = budgetCap > 0 ? Math.min((subtotal / budgetCap) * 100, 100) : 0;
  const progressMax = Math.max(budgetCap, subtotal, 1);

  const itemRows = items.length
    ? items.map((item) => {
        const id = sanitizeHTML(String(item.id ?? ''));
        const name = sanitizeHTML(item.name ?? 'Item');
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        const lineTotal = (price * qty).toFixed(2);

        return `
          <li class="pos-item" data-id="${id}">
            <span class="pos-item__name">
              ${name}${qty > 1 ? ` <span class="pos-item__qty">×${qty}</span>` : ''}
            </span>
            <span class="pos-item__price">₱${lineTotal}</span>
            <button
              type="button"
              class="icon-btn icon-btn--danger icon-btn--small"
              data-action="remove-item"
              data-id="${id}"
              aria-label="Remove ${name} from cart"
            >✕</button>
          </li>
        `;
      }).join('')
    : `<li class="pos-item pos-item--empty">No items scanned yet.</li>`;

  container.innerHTML = `
    <div class="pos-register ${isOverBudget ? 'pos-register--over' : ''}">
      <ul class="pos-item-list">${itemRows}</ul>

      <div class="pos-summary">
        <div class="pos-summary__row">
          <span>Subtotal</span>
          <strong>₱${subtotal.toFixed(2)}</strong>
        </div>
        <div class="pos-summary__row">
          <span>Budget cap</span>
          <strong>₱${budgetCap.toFixed(2)}</strong>
        </div>

        <div class="pos-progress-wrap">
          <progress
            class="pos-progress"
            value="${subtotal}"
            max="${progressMax}"
            aria-label="Budget used"
          ></progress>
          <span class="pos-progress__label">${percentUsed.toFixed(0)}% used</span>
        </div>

        <div class="pos-summary__row pos-summary__row--remaining ${isOverBudget ? 'is-over' : ''}">
          <span>${isOverBudget ? 'Over budget by' : 'Remaining'}</span>
          <strong>₱${Math.abs(remaining).toFixed(2)}</strong>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sets up a single delegated click listener on `rootElement`.
 * Any descendant with a `data-action` attribute triggers the matching
 * handler in `actionMap`, receiving (element, event) as arguments.
 * Uses `closest()` so clicks on icons/text inside a button still work.
 */
export function setupActionDelegation(rootElement, actionMap) {
  if (!rootElement) return;

  rootElement.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target || !rootElement.contains(target)) return;

    const action = target.dataset.action;
    const handler = actionMap?.[action];

    if (typeof handler === 'function') {
      handler(target, e);
    }
  });
}
