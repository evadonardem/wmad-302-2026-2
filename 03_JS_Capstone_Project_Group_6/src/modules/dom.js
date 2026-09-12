/**
 * [ROLE B] DOM & UI Module
 */

export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}


// Displays all residents as cards
export function renderResidentCards(container, residents) {

  // Check if there are no residents
  if (!residents || residents.length === 0) {
    container.innerHTML = '<p>No residents yet.</p>';
    return;
  }

  // This will store all the resident cards
  let html = '';

  // Go through each resident
  for (let i = 0; i < residents.length; i++) {

    const resident = residents[i];

    // Make the resident's name safe
    const safeName = sanitizeHTML(resident.name);

    // Create the resident card
    html += `
      <div class="resident-card">
        <span>${safeName}</span>

        <!-- Button for removing the resident -->
        <button data-action="remove-resident" data-id="${resident.id}">
          Remove
        </button>
      </div>
    `;
  }

  // Display all resident cards on the page
  container.innerHTML = html;
}


// Displays the relief pack items and budget
export function renderPOSRegister(container, packerState) {

  // Get the data from the packer
  const items = packerState.items;
  const total = packerState.total;
  const budgetCap = packerState.budgetCap;

  // This will store the item list
  let itemsHTML = '';

  // Check if there are no items
  if (!items || items.length === 0) {
    itemsHTML = '<p>No items yet.</p>';

  } else {

    // Go through each item
    for (let i = 0; i < items.length; i++) {

      const item = items[i];

      // Make the item name safe
      const safeName = sanitizeHTML(item.name);

      // Create the item list
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

  // Display the total, budget, progress bar, and items
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


// Handles button clicks
export function setupActionDelegation(rootElement, actionMap) {

  // Add one click listener to the parent element
  rootElement.addEventListener('click', (event) => {

    // Find the button that was clicked
    const actionElement = event.target.closest('[data-action]');

    // Stop if the click was not on an action button
    if (!actionElement) return;

    // Get the action from the button
    const action = actionElement.dataset.action;

    // Get the resident ID if available
    const id = actionElement.dataset.id;

    // Get the item index if available
    const index = actionElement.dataset.index;

    // Find the function that handles the action
    const handler = actionMap[action];

    // Run the function if it exists
    if (typeof handler === 'function') {
      handler(id !== undefined ? id : index);

    } else {

      // Show a warning if no function was found
      console.warn(`No handler found for action: "${action}"`);
    }
  });
}