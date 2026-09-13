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

  const rows = residents.map((resident, index) => {
    const id = sanitizeHTML(String(resident.id ?? ''));
    const name = sanitizeHTML(resident.name ?? 'Unknown resident');
    const priority = sanitizeHTML(String(resident.priority ?? 'low').toLowerCase());
    const need = sanitizeHTML(resident.need ?? resident.concern ?? '');
    const queueNumber = sanitizeHTML(String(resident.queueNumber ?? index + 1).padStart(3, '0'));
    const waitMinutes = resident.waitMinutes;
    const waitLabel = (waitMinutes !== undefined && waitMinutes !== null)
      ? `${sanitizeHTML(String(waitMinutes))} min wait`
      : '';

    return `
      <article class="resident-ticket" data-priority="${priority}" data-id="${id}">
        <div class="resident-ticket__number">
          <span class="resident-ticket__number-label">No.</span>
          <span class="resident-ticket__number-value">${queueNumber}</span>
        </div>
        <div class="resident-ticket__body">
          <h3 class="resident-ticket__name">${name}</h3>
          ${need ? `<p class="resident-ticket__need">${need}</p>` : ''}
          ${waitLabel ? `<p class="resident-ticket__wait">${waitLabel}</p>` : ''}
        </div>
        <div class="resident-ticket__side">
          <span class="stamp ${priority}">${priority}</span>
          <button
            type="button"
            class="ticket-remove"
            data-action="remove-resident"
            data-id="${id}"
            aria-label="Remove ${name} from the queue"
          >Remove</button>
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `<div class="queue-list">${rows}</div>`;
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
          <li class="receipt__item" data-id="${id}">
            <span class="receipt__item-name">
              ${name}${qty > 1 ? ` <span class="receipt__qty">×${qty}</span>` : ''}
            </span>
            <span class="receipt__dots" aria-hidden="true"></span>
            <span class="receipt__item-price">₱${lineTotal}</span>
            <button
              type="button"
              class="receipt__remove"
              data-action="remove-item"
              data-id="${id}"
              aria-label="Remove ${name} from cart"
            >✕</button>
          </li>
        `;
      }).join('')
    : `<li class="receipt__item receipt__item--empty">No items scanned yet.</li>`;

  container.innerHTML = `
    <div class="receipt" data-over-budget="${isOverBudget}">
      <h3 class="receipt__heading">Relief Goods Register</h3>
      <ul class="receipt__items">${itemRows}</ul>
      <div class="receipt__rule"></div>

      <div class="receipt__row">
        <span>Subtotal</span>
        <span>₱${subtotal.toFixed(2)}</span>
      </div>
      <div class="receipt__row">
        <span>Budget cap</span>
        <span>₱${budgetCap.toFixed(2)}</span>
      </div>

      <div class="receipt__gauge">
        <progress
          class="receipt__progress"
          value="${subtotal}"
          max="${progressMax}"
          aria-label="Budget used"
        ></progress>
        <span class="receipt__gauge-label">${percentUsed.toFixed(0)}% used</span>
      </div>

      <div class="receipt__row receipt__row--total">
        <span>${isOverBudget ? 'Over budget by' : 'Remaining'}</span>
        <span>₱${Math.abs(remaining).toFixed(2)}</span>
      </div>

      <div class="receipt__tear"></div>
    </div>
  `;
}

/**
 * Sets up a single delegated click listener on `rootElement`.
 * Any descendant with a `data-action` attribute triggers the matching
 * handler in `actionMap`, receiving (element, event) as arguments.
 * Uses `closest()` so clicks on icons/text inside a button still work.
 *
 * Also drives the visual press/release feedback on the target button:
 * `.is-down` while the pointer is held down, then a brief `.is-up`
 * flash on release, so hover / down / up / click each render as a
 * distinct color in style.css.
 */
export function setupActionDelegation(rootElement, actionMap) {
  if (!rootElement) return;

  const FLASH_MS = 220;

  rootElement.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target || !rootElement.contains(target)) return;
    target.classList.remove('is-up');
    target.classList.add('is-down');
  });

  const releasePress = (e) => {
    const target = e.target.closest('[data-action]');
    if (!target || !rootElement.contains(target)) return;
    if (!target.classList.contains('is-down')) return;
    target.classList.remove('is-down');
    target.classList.add('is-up');
    setTimeout(() => target.classList.remove('is-up'), FLASH_MS);
  };

  rootElement.addEventListener('pointerup', releasePress);
  rootElement.addEventListener('pointercancel', releasePress);

  rootElement.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    console.log(target);
    if (!target || !rootElement.contains(target)) return;

    const action = target.dataset.action;
    const handler = actionMap?.[action];

    if (typeof handler === 'function') {
      handler(target, e);
    }
  });
}

/**
 * Wires the same hover / down / up press feedback used by delegated
 * `[data-action]` buttons onto a single standalone button — for cases
 * like a form's primary `.btn` that isn't part of an action map.
 */
export function bindButtonFeedback(button) {
  if (!button) return;

  const FLASH_MS = 220;

  button.addEventListener('pointerdown', () => {
    button.classList.remove('is-up');
    button.classList.add('is-down');
  });

  const release = () => {
    if (!button.classList.contains('is-down')) return;
    button.classList.remove('is-down');
    button.classList.add('is-up');
    setTimeout(() => button.classList.remove('is-up'), FLASH_MS);
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
}
