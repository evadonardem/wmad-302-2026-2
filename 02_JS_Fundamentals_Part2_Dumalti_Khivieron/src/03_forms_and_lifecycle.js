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

    let valid = true;

    if(name.length <= 5 ) {
      errName.textContent = 'Name must be atleast 5 letters';
      valid = false;
    }
    if(purok === '') {
      errPurok.textContent = 'Please select a Purok';
      valid = false;
    }
    if(!valid)return;

    const card = document.createElement('div');
    card.className = 'Resident Card';

    card.innerHTML = `
      <h3>🏛️ Barangay Resident Card</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Zone:</strong> ${purok}</p>`;

    cardsGrid.appendChild(card);
    form.reset();
  });
}