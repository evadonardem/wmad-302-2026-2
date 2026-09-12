export function initResidentIdGenerator() {
  const form = document.getElementById('resident-form');
  const nameInput = document.getElementById('res-name');
  const purokSelect = document.getElementById('res-purok');
  const errName = document.getElementById('err-name');
  const errPurok = document.getElementById('err-purok');
  const cardsGrid = document.getElementById('id-cards-grid');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // TODO:
    // 1. Validate name length >= 5
    // 2. Validate purok selection is not empty
    // 3. Render resident card string to cardsGrid if valid
    // 4. Reset form fields upon success
    const nameVal = nameInput.value.trim();
    const purokVal = purokSelect.value.trim();
    let isValid = true;

    // Reset error messages
    if (errName) errName.textContent = '';
    if (errPurok) errPurok.textContent = '';

    // 1. Validate name length >= 5
    if (nameVal.length < 5) {
      if (errName) errName.textContent = 'Name must be at least 5 characters long.';
      isValid = false;
    }

    // 2. Validate purok selection is not empty
    if (!purokVal) {
      if (errPurok) errPurok.textContent = 'Please select a purok.';
      isValid = false;
    }

    // 3 & 4. Render resident card and reset form upon success
    if (isValid) {
      if (cardsGrid) {
        const cardHTML = `
          <div class="resident-card">
            <h3>${nameVal}</h3>
            <p>Purok: ${purokVal}</p>
          </div>
        `;
        cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
      }

      form.reset();
    }
  });
}