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
    const nameInput = document.getElementById('res-name');
    const purokInput = document.getElementById('res-purok');
    const errName = document.getElementById('err-name');
    const errPurok = document.getElementById('err-purok');

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const purokVal = purokInput ? purokInput.value.trim() : '';

    let isValid = true;

    // Clear previous error messages
    if (errName) errName.textContent = '';
    if (errPurok) errPurok.textContent = '';

    // 1. Validate name length >= 5 (trimmed)
    if (nameVal.length < 5) {
      if (errName) errName.textContent = 'Name must be at least 5 characters long.';
      isValid = false;
    }

    // 2. Validate purok selection is not empty
    if (!purokVal) {
      if (errPurok) errPurok.textContent = 'Please select a purok/zone.';
      isValid = false;
    }

    // 3. Render resident card HTML to cardsGrid if valid
    if (isValid) {
      const cardHTML = `
      <div class="resident-card">
        <h3>🏛 Barangay Resident Card</h3>
        <p><strong>Name:</strong> ${nameVal}</p>
        <p><strong>Zone:</strong> ${purokVal}</p>
      </div>
    `;

      cardsGrid.insertAdjacentHTML('beforeend', cardHTML);

      // 4. Reset form fields upon success
      form.reset();
    }
  });
}