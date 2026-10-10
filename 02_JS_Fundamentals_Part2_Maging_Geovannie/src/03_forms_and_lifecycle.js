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

    const name = nameInput.value.trim();
    const purok = purokSelect.value;

    errName.textContent = '';
    errPurok.textContent = '';

    let isValid = true;

    if (name.length < 5) {
      errName.textContent = 'Name must be at least 5 characters';
      isValid = false;
    }

    if (!purok) {
      errPurok.textContent = 'Please select a purok';
      isValid = false;
    }

    if (isValid) {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'id-card';
      cardDiv.innerHTML = `
        <h3>${name}</h3>
        <p>Purok: ${purok}</p>
      `;
      cardsGrid.appendChild(cardDiv);

      nameInput.value = '';
      purokSelect.value = '';
    }
  });
}