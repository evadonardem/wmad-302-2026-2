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
    const name = nameInput.value.trim();
    const purok = purokSelect.value;

    let isValid = true;

    if (name.length < 5) {
      if (errName) {
        errName.textContent = 'Name must be at least 5 characters long.';
      }
      isValid = false;
    } else {
      if (errName) {
        errName.textContent = '';
      }
    }

    if (!purok) {
      if (errPurok) {
        errPurok.textContent = 'Please select a purok.';
      }
      isValid = false;
    }else {
      if (errPurok) {
        errPurok.textContent = '';
      }
    }

    if (!isValid) {
      return;
    }
    if (cardsGrid) {
      cardsGrid.insertAdjacentHTML('beforeend', `
        <div class="resident-card">
          <h3>🏛️ Barangay Resident Card</h3>
          <p><strong>Name:</strong> [FullName]</p>
          <p><strong>Zone:</strong> [Purok]</p>
        </div>
      `);
    }

    form.reset();
  });
}