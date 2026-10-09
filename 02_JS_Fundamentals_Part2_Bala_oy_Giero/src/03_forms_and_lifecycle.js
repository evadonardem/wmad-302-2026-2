export function initResidentIdGenerator() {
  const form = document.getElementById('resident-form');
  const nameInput = document.getElementById('res-name');
  const purokSelect = document.getElementById('res-purok');
  const errName = document.getElementById('err-name');
  const errPurok = document.getElementById('err-purok');
  const cardsGrid = document.getElementById('id-cards-grid');

  if (!form) return;

  let cardCount = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // TODO:
    // 1. Validate name length >= 5
    // 2. Validate purok selection is not empty
    // 3. Render resident card string to cardsGrid if valid
    // 4. Reset form fields upon success
    const name = nameInput.value.trim();
    const purok = purokSelect.value;

    const nameValid = name.length >= 5;
    const purokValid = purok !== '';

    errName.textContent = nameValid ? '' : 'Name must be at least 5 characters.';
    errPurok.textContent = purokValid ? '' : 'Please select a purok.';

    if (!nameValid || !purokValid) return;

    cardCount++;
    const card = document.createElement('div');
    card.className = 'id-card';
    card.textContent = `RES-${String(cardCount).padStart(4, '0')} | ${name} | ${purok}`;
    cardsGrid.appendChild(card);

    form.reset();
  });
}