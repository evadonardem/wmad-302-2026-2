export function initResidentIdGenerator() {
  const form = document.getElementById('resident-form');
  const nameInput = document.getElementById('res-name');
  const purokSelect = document.getElementById('res-purok');
  const errName = document.getElementById('err-name');
  const errPurok = document.getElementById('err-purok');
  const cardsGrid = document.getElementById('id-cards-grid');

  if (!form) return;

  const MIN_NAME_LENGTH = 5;
  let cardCount = 0;

  const escapeHTML = (str) =>
    str.replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // TODO:
    const name = nameInput.value.trim();
    const purok = purokSelect.value;

    // 1. Validate name length >= 5
    const nameValid = name.length >= MIN_NAME_LENGTH;
    errName.textContent = nameValid
      ? ''
      : `Name must be at least ${MIN_NAME_LENGTH} characters.`;

    // 2. Validate purok selection is not empty
    const purokValid = purok !== '';
    errPurok.textContent = purokValid ? '' : 'Please select a purok.';

    if (!nameValid || !purokValid) return;

    // 3. Render resident card string to cardsGrid if valid
    cardCount++;
    const idNumber = String(cardCount).padStart(4, '0');
    const card = `
      <div class="id-card">
        <h3>${escapeHTML(name)}</h3>
        <p>Purok: ${escapeHTML(purok)}</p>
        <p>ID No: RES-${idNumber}</p>
      </div>`;
    cardsGrid.insertAdjacentHTML('beforeend', card);

    // 4. Reset form fields upon success
    form.reset();
    nameInput.focus();
  });
}