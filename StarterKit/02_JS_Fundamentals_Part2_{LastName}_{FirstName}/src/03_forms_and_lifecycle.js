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

  const validName = name.length >= 5;
  const validPurok = purok !== '';

  errName.textContent = validName ? '' : 'Name must be at least 5 characters.';
  errPurok.textContent = validPurok ? '' : 'Please select a purok.';

  if (!validName || !validPurok) return;

  const card = document.createElement('div');
  card.className = 'resident-card';
  card.textContent = `Resident: ${name} | Purok: ${purok}`;

  cardsGrid.appendChild(card);

  form.reset();
  errName.textContent = '';
  errPurok.textContent = '';
  });
}