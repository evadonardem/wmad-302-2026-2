/**
 * [ROLE B] DOM & UI Module
 */

export function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str ?? "";
  return temp.innerHTML;
}

export function renderResidentCards(container, residents) {
  if (!residents || residents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No residents registered yet.
      </div>
    `;
    return;
  }

  container.innerHTML = residents
    .map((resident) => {
      const safeName = sanitizeHTML(resident.name);
      const safeProvince = sanitizeHTML(resident.province);
      const safeCity = sanitizeHTML(resident.city);

      return `
        <div class="resident-card" data-priority="${resident.priority}">
          <div class="resident-header">
            <h3>${safeName}</h3>

            <span class="badge ${resident.priority.toLowerCase()}">
              ${resident.priority}
            </span>
          </div>

          <p><strong>Location:</strong> ${safeCity}, ${safeProvince}</p>

          <p>
            <strong>Monthly Income:</strong>
            ₱${Number(resident.monthlyIncome).toLocaleString()}
          </p>

          <p>
            <strong>Dependents:</strong>
            ${resident.dependentCount ?? 0}
          </p>

          <p>
            <strong>Score:</strong>
            ${resident.score}
          </p>

          <p>
            <strong>Status:</strong>
            ${resident.approved ? "Approved" : "Not Approved"}
          </p>

          <button
            type="button"
            class="btn danger"
            data-action="remove-resident"
            data-id="${resident.id}"
          >
            Remove
          </button>
        </div>
      `;
    })
    .join("");
}

export function renderPOSRegister(container, packerState) {
  const items = packerState.getItems();
  const total = packerState.getTotal();
  const budgetCap = packerState.getBudgetCap();
  const remaining = budgetCap - total;

  const progressValue = Math.min((total / budgetCap) * 100, 100);

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
        value="${progressValue}"
        max="100"
      ></progress>

      <h3>Items</h3>

      ${
        items.length === 0
          ? `<p class="empty-state">No items added yet.</p>`
          : `
            <ul class="pos-items">
              ${items
                .map(
                  (item, index) => `
                    <li>
                      <span>
                        ${sanitizeHTML(item.name)}
                        - ₱${item.price.toFixed(2)}
                      </span>

                      <button
                        type="button"
                        class="btn danger small"
                        data-action="remove-item"
                        data-id="${index}"
                      >
                        Remove
                      </button>
                    </li>
                  `
                )
                .join("")}
            </ul>
          `
      }
    </div>
  `;
}

export function setupActionDelegation(rootElement, actionMap) {
  rootElement.addEventListener("click", (e) => {
    const actionElement = e.target.closest("[data-action]");

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;

    if (actionMap[action]) {
      actionMap[action](actionElement);
    }
  });
}