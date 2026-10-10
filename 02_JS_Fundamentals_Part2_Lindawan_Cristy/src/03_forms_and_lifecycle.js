const residentForm = document.querySelector('#resident-form');
const errName = document.querySelector('#err-name');
const errPurok = document.querySelector('#err-purok');
const idCardsGrid = document.querySelector('#id-cards-grid');

if (residentForm) {
  residentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.querySelector('#res-name');
    const purokInput = document.querySelector('#res-purok');

    const trimmedName = nameInput ? nameInput.value.trim() : '';
    const selectedPurok = purokInput ? purokInput.value : '';

    let isValid = true;

    // Reset error messages
    if (errName) errName.textContent = '';
    if (errPurok) errPurok.textContent = '';

    // Validate Name (>= 5 characters)
    if (trimmedName.length < 5) {
      if (errName) errName.textContent = 'Name must be at least 5 characters long.';
      isValid = false;
    }

    // Validate Purok selection
    if (!selectedPurok) {
      if (errPurok) errPurok.textContent = 'Please select a purok/zone.';
      isValid = false;
    }

    // If valid, append card and reset form
    if (isValid) {
      const card = document.createElement('div');
      card.className = 'resident-card';
      card.innerHTML = `
        <h3>🏛️ Barangay Resident Card</h3>
        <p><strong>Name:</strong> ${trimmedName}</p>
        <p><strong>Zone:</strong> ${selectedPurok}</p>
      `;

      if (idCardsGrid) {
        idCardsGrid.appendChild(card);
      }

      residentForm.reset();
    }
  });
}