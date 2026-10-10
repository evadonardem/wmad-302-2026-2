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

    const residentName = nameInput.ariaValueMax.trim();
    const selectedPurok = purokSelect.value;

    errName.textContent = '';
    errPurok.textContent = '';

    let valid = true;

    if(residentName.length < 5){
      errName.textContent = 'Name must be at least 5 charcaters.';
      valid = false;
    }

    if(selectedPurok === ''){
      errPurok.textContent = 'Please select a Purok.';
      valid = false;
    }

    if( valid){
      const residentCard = `
      <div class = "resident-card">
      <h3> Barangay Resident Card</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Zone:</strong> ${purok}</p>
      </div>`;

      form.reset();
    }

    // TODO:
    // 1. Validate name length >= 5
    // 2. Validate purok selection is not empty
    // 3. Render resident card string to cardsGrid if valid
    // 4. Reset form fields upon success
  });
}