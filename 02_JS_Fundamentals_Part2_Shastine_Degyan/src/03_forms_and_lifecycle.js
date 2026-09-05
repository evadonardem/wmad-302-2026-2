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

    errName.textContent = '';
    errPurok.textContent = '';

    const fullName = nameInput.value.trim();
    const purok = purokSelect.value;

    let isValid = true;

    if (fullName.length < 5) {
      errName.textContent = 'Name must be at least 5 characters.';
      isValid = false;
    }

    if (purok === '') {
      errPurok.textContent = 'Please select a Purok / Zone.';
      isValid = false;
    }

    if (!isValid) return;

    const card = document.createElement('div');
    card.className = 'resident-card';

    card.innerHTML = `
      <h3>🏛️ Barangay Resident Card</h3>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Zone:</strong> ${purok}</p>
    `;

    cardsGrid.appendChild(card);

    form.reset();
  });
}