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

    const name = nameInput?.value.trim() || '';
    const purok = purokSelect?.value || '';
    let isValid = true;

    // 1. Validate name length >= 5
    if (name.length < 5) {
      if (errName) errName.style.display = 'block';
      isValid = false;
    } else {
      if (errName) errName.style.display = 'none';
    }

    // 2. Validate purok selection is not empty
    if (!purok) {
      if (errPurok) errPurok.style.display = 'block';
      isValid = false;
    } else {
      if (errPurok) errPurok.style.display = 'none';
    }

    if (!isValid) return;

    // Generate a simple unique ID number
    const idNumber = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Render resident card string to cardsGrid if valid
    const cardHTML = `
      <div class="resident-card">
        <h3>${name}</h3>
        <p><strong>Purok:</strong> ${purok}</p>
        <p class="id-number">ID: ${idNumber}</p>
      </div>
    `;

    if (cardsGrid) {
      cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
    }

    // 4. Reset form fields upon success
    form.reset();
  });
}