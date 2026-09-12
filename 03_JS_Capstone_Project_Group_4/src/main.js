/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

// TODO: Import required functions from engine.js, dom.js, and async.js
// TODO: Initialize DOM elements, load initial LocalStorage queue, fetch provinces, setup event listeners for form submission, cascading province/city dropdowns, POS packer, and action delegation.
/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

// 1. Wire named ES module imports across all files
import { 
  evaluateEligibility, 
  calculateReliefPacks 
} from './engine.js';

import { 
  renderQueue, 
  populateSelectOptions, 
  updatePackerSummary, 
  showNotification 
} from './dom.js';

import { 
  fetchProvinces, 
  fetchCitiesMunicipalities, 
  getOfflineQueue, 
  saveToOfflineQueue, 
  removeFromOfflineQueue 
} from './async.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log("e-Barangay Starter Kit Initialized. Happy Coding!");

  // DOM Elements
  const form = document.querySelector('#application-form');
  const provinceSelect = document.querySelector('#province-select');
  const citySelect = document.querySelector('#city-select');
  const queueContainer = document.querySelector('#queue-container');
  const inventoryInput = document.querySelector('#inventory-input');
  const familySizeInput = document.querySelector('#family-size-input');
  const packSummaryContainer = document.querySelector('#pack-summary');

  // Load and render initial LocalStorage queue
  let offlineQueue = getOfflineQueue();
  renderQueue(queueContainer, offlineQueue);

  // Load initial Provinces for Cascading Dropdown
  try {
    const provinces = await fetchProvinces();
    populateSelectOptions(provinceSelect, provinces, 'code', 'name');
  } catch (error) {
    showNotification('Failed to load provinces', 'error');
  }

  // Cascading Province/City Dropdown Event Listener
  if (provinceSelect) {
    provinceSelect.addEventListener('change', async (e) => {
      const provinceCode = e.target.value;
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Select City / Municipality</option>';
        if (provinceCode) {
          const cities = await fetchCitiesMunicipalities(provinceCode);
          populateSelectOptions(citySelect, cities, 'code', 'name');
        }
      }
    });
  }

  // Form Submission Listener (Scoring Logic + Offline Storage + DOM Update)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const appData = {
        id: Date.now().toString(),
        applicantName: formData.get('applicantName') || '',
        monthlyIncome: Number(formData.get('monthlyIncome')) || 0,
        dependents: Number(formData.get('dependents')) || 0,
        isPWD: formData.get('isPWD') === 'on' || formData.get('isPWD') === 'true',
        provinceCode: formData.get('provinceCode') || '',
        cityCode: formData.get('cityCode') || '',
        submittedAt: new Date().toISOString()
      };

      // Execute Scoring Logic
      const scoringResult = evaluateEligibility(appData);
      const fullApplicationRecord = { ...appData, ...scoringResult };

      // Update Offline Storage
      saveToOfflineQueue(fullApplicationRecord);

      // Re-render the DOM Queue
      offlineQueue = getOfflineQueue();
      renderQueue(queueContainer, offlineQueue);

      // Reset Form & Notify User
      form.reset();
      if (citySelect) citySelect.innerHTML = '<option value="">Select City / Municipality</option>';
      showNotification('Application queued successfully!', 'success');
    });
  }

  // POS Relief Packer Action Handlers
  const updatePOSPacker = () => {
    if (inventoryInput && familySizeInput && packSummaryContainer) {
      const totalInventory = Number(inventoryInput.value) || 0;
      const familySize = Number(familySizeInput.value) || 0;

      const packingResult = calculateReliefPacks(totalInventory, familySize);
      updatePackerSummary(packSummaryContainer, packingResult);
    }
  };

  if (inventoryInput) inventoryInput.addEventListener('input', updatePOSPacker);
  if (familySizeInput) familySizeInput.addEventListener('input', updatePOSPacker);

  // Global Action Delegation for Queue Item Actions (e.g. Delete/Sync)
  if (queueContainer) {
    queueContainer.addEventListener('click', (e) => {
      const target = e.target;
      const removeBtn = target.closest('[data-action="delete"]');

      if (removeBtn) {
        const itemId = removeBtn.dataset.id;
        if (itemId) {
          removeFromOfflineQueue(itemId);
          offlineQueue = getOfflineQueue();
          renderQueue(queueContainer, offlineQueue);
          showNotification('Application removed from offline queue.', 'info');
        }
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("e-Barangay Starter Kit Initialized. Happy Coding!");
});
