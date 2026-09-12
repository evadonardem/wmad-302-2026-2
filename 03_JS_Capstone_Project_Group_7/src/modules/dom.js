/**
 * [ROLE B] DOM & UI Module - Student Starter Template
 */

export function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function renderResidentCards(container, residents) {
  container.innerHTML = "";
  if (residents.length === 0) {
    container.innerHTML = "<p>No registered residents yet.</p>";
    return;
  }

  residents.forEach((resident) => {
    const card = document.createElement("div");

    card.className = "resident-card";
    card.setAttribute("data-priority", resident.priority);
    card.innerHTML = `
      <div>
        <h3>${sanitizeHTML(resident.name)}</h3>
        <p>
          <strong>Location:</strong>
          ${sanitizeHTML(resident.province)},
          ${sanitizeHTML(resident.city)}
        </p>
        <p>
          <strong>Income:</strong>
          ₱${Number(resident.monthlyIncome).toLocaleString()}
        </p>
        <p>
          <strong>Score:</strong>
          ${resident.score}
        </p>
        <p>
          <strong>Priority:</strong>
          ${resident.priority}
        </p>
        <p>
          <strong>Status:</strong>
          ${resident.approved ? "Approved" : "Not Approved"}
        </p>
      </div>

      <button
        type="button"
        class="btn danger"
        data-action="remove-resident"
        data-id="${resident.id}">
        Remove
      </button>
    `;

    container.appendChild(card);
  });
}

export function renderPOSRegister(container, packerState) {
  const total = packerState.getTotal();
  const budgetCap = packerState.getBudgetCap();
  const items = packerState.getItems();

  const remaining = budgetCap - total;

  let itemHTML = "";

  if (items.length === 0) {
    itemHTML = "<p>No items added yet.</p>";
  } else {
    items.forEach((item, index) => {
      itemHTML += `
        <div class="pos-item">
          <span>
            ${sanitizeHTML(item.name)}
            - ₱${item.price.toFixed(2)}
          </span>

          <button
            type="button"
            class="btn danger"
            data-action="remove-item"
            data-index="${index}">
            Remove
          </button>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <div class="pos-summary">
      <p>
        <strong>Subtotal:</strong>
        ₱${total.toFixed(2)}
      </p>

      <p>
        <strong>Budget Cap:</strong>
        ₱${budgetCap.toFixed(2)}
      </p>

      <p>
        <strong>Remaining Budget:</strong>
        ₱${remaining.toFixed(2)}
      </p>

      <progress
        value="${total}"
        max="${budgetCap}">
      </progress>
    </div>

    <div class="pos-items">
      ${itemHTML}
    </div>
  `;
}

export function setupActionDelegation(rootElement, actionMap) {
  rootElement.addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    if (actionMap[action]) {
      actionMap[action](button, e);
    }
  });
}