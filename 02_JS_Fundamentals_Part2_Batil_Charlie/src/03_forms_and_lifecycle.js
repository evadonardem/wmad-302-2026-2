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
    const purok = purokSelect.value.trim();

    
    errName.textContent = '';
    errPurok.textContent = '';

    
    if (name.length < 5) {
      errName.textContent = 'Name must be at least 5 characters';
      return;
    }

    
    if (!purok) {
      errPurok.textContent = 'Please select a purok';
      return;
    }

    
    const residentId = `RES-${Date.now()}`;
    const cardHTML = `
      <div class="resident-card">
        <div class="card-header">Resident ID Card</div>
        <div class="card-content">
          <div class="card-field">
            <span class="card-label">ID:</span>
            <span class="card-value">${residentId}</span>
          </div>
          <div class="card-field">
            <span class="card-label">Name:</span>
            <span class="card-value">${name}</span>
          </div>
          <div class="card-field">
            <span class="card-label">Purok:</span>
            <span class="card-value">${purok}</span>
          </div>
        </div>
      </div>
    `;

    
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHTML;
    cardsGrid.appendChild(cardElement.firstElementChild);

    
    form.reset();
  });
}