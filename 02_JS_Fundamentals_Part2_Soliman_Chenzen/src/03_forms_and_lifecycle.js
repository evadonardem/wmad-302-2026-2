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
    const isNameValid = name.length >= 5;
    const isPurokValid = purok !== '';

    errName.textContent = isNameValid ? '' : 'Name must be at least 5 characters.';
    errPurok.textContent = isPurokValid ? '' : 'Please select a purok.';

    if (!isNameValid || !isPurokValid) return;

    const card = document.createElement('div');
    card.className = 'resident-card';

    const heading = document.createElement('h3');
    heading.textContent = '🏛️ Barangay Resident Card';
    card.append(heading);

    const nameLine = document.createElement('p');
    nameLine.innerHTML = '<strong>Name:</strong> ';
    nameLine.append(document.createTextNode(name));
    card.append(nameLine);

    const purokLine = document.createElement('p');
    purokLine.innerHTML = '<strong>Zone:</strong> ';
    purokLine.append(document.createTextNode(purok));
    card.append(purokLine);

    cardsGrid.append(card);
    form.reset();
  });
}