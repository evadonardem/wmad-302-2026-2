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

    // TODO:
    // 1. Validate name length >= 5
    const name = nameInput.value.trim();

    if (name.length < 5) { 
      errName.textContent = 'Name must be at least 5 characters.'; 
    } else { 
      errName.textContent = ''; 
    }

    // 2. Validate purok selection is not empty
    
    const purok = purokSelect.value; 
    if (purok === '') { 
      errPurok.textContent = 'Please select a Purok / Zone.'; 
    } else { 
      errPurok.textContent = ''; 
    } 

    if (name.length < 5 || purok === '') { 
      return; 
    }

    // 3. Render resident card string to cardsGrid if valid
    const card = document.createElement('div'); 
    card.className = 'resident-card'; 
    card.innerHTML = ` 
      <h3>Barangay Clearance ID</h3> 
      <p><strong>Name:</strong> ${name}</p> 
      <p><strong>Zone:</strong> ${purok}</p> 
    `; 

    cardsGrid.appendChild(card);
    
    // 4. Reset form fields upon success
    form.reset();
  });
}