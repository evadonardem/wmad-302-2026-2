/**
 * [ROLE B] DOM & UI Module
 */

export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}


export function renderResidentCards(container, residents) {
  // TODO: Render resident cards into container. 
  // Handle empty state if residents array is empty.
  // Include data-action="remove-resident" and data-id attributes on delete buttons.
  if (!residents || residents.length === 0) {
    container.innerHTML = '<p>No residents yet.</p>';
    return;
  }

  let html = '';

  for (let i = 0; i < residents.length; i++) {
    const resident = residents[i];
    const safeName = sanitizeHTML(resident.name);

    html += `
      <div class="resident-card" data-priority="${resident.priority}">
        <span>${safeName}</span>
        <span class="badge ${resident.priority.toLowerCase()}">${resident.priority}</span>
        <p>Score: ${resident.score} | Approved: ${resident.approved ? 'Yes' : 'No'}</p>
        <button data-action="remove-resident" data-id="${resident.id}">
          Remove
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}


export function renderPOSRegister(container, packerState) {
  // TODO: Render POS register showing subtotal, budget cap, <progress> bar, and item list with remove buttons.

  const items = packerState.items;
  const total = packerState.total;
  const budgetCap = packerState.budgetCap;

  let itemsHTML = '';

  if (!items || items.length === 0) {
    itemsHTML = '<p>No items yet.</p>';

  } else {

    for (let i = 0; i < items.length; i++) {

      const item = items[i];

      const safeName = sanitizeHTML(item.name);

      itemsHTML += `
        <li>
          ${safeName} - $${item.price.toFixed(2)}

          <!-- Button for removing this item -->
          <button data-action="remove-item" data-index="${i}">
            Remove
          </button>
        </li>
      `;
    }
  }

  container.innerHTML = `
    <div class="pos-register">
      <p>
        Subtotal: $${total.toFixed(2)}
        / Budget: $${budgetCap.toFixed(2)}
      </p>

      <!-- Shows how much of the budget is being used -->
      <progress value="${total}" max="${budgetCap}"></progress>

      <!-- Shows the list of items -->
      <ul>${itemsHTML}</ul>
    </div>
  `;
}


export function setupActionDelegation(rootElement, actionMap) {
  // TODO: Implement event delegation on rootElement for elements with [data-action].
  rootElement.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;

    const action = actionElement.dataset.action;
    const handler = actionMap[action];

    if (typeof handler === 'function') {
      handler(actionElement); // pass the element itself
    } else {
      console.warn(`No handler found for action: "${action}"`);
    }
  });
}