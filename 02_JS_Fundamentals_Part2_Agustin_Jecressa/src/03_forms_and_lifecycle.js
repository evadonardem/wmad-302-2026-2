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

    let hasError = false;

    if (nameInput.value.trim().length < 5) {
      errName.textContent = 'Name must be at least 5 characters';
      hasError = true;
    } else {
      errName.textContent = '';
    }

    if (purokSelect.value === '') {
      errPurok.textContent = 'Please select a purok';
      hasError = true;
    } else {
      errPurok.textContent = '';
    }

    if (hasError) return;

    const card = `
      <div class="resident-card">
        <h3>${nameInput.value.trim()}</h3>
        <p>Purok: ${purokSelect.value}</p>
      </div>
    `;
    cardsGrid.innerHTML += card;

    form.reset();

  });
}