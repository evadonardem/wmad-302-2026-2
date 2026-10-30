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

    const fullName = nameInput.value.trim();
    const purok = purokSelect.value.trim();

    const validName = fullName.length >= 5;

    const validPurok = purok !== '';

    if (errName) {
      errName.textContent = validName
        ? ''
        : 'Name must be at least 5 characters long.';
    }

    if (errPurok) {
      errPurok.textContent = validPurok
        ? ''
        : 'Please select a purok.';
    }

    if (!validName || !validPurok) return;

    if (!cardsGrid) return;

    const card = document.createElement('div');
    card.className = 'resident-card';

    const heading = document.createElement('h3');
    heading.textContent = '🏛️ Barangay Resident Card';

    const nameParagraph = document.createElement('p');
    const nameLabel = document.createElement('strong');
    nameLabel.textContent = 'Name: ';
    nameParagraph.append(nameLabel, document.createTextNode(fullName));

    const purokParagraph = document.createElement('p');
    const purokLabel = document.createElement('strong');
    purokLabel.textContent = 'Zone: ';
    purokParagraph.append(purokLabel, document.createTextNode(purok));

    card.append(heading, nameParagraph, purokParagraph);
    cardsGrid.appendChild(card);

    form.reset();

    if (errName) errName.textContent = '';
    if (errPurok) errPurok.textContent = '';
  });
}