/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

import { evaluateAyudaEligibility, createReliefPacker } from './engine.js';

// ASSUMED exports from dom.js — please confirm/correct:
import {
  renderProvinceDropdown,
  renderCityDropdown,
  renderEligibilityResult,
  renderPackerState,
  getFormValues,
} from './dom.js';

// ASSUMED exports from async.js — please confirm/correct:
import {
  fetchProvinces,
  fetchCitiesByProvince,
  loadQueueFromStorage,
  saveQueueToStorage,
} from './async.js';

const STORAGE_KEY = 'ayuda_queue'; // ASSUMPTION: confirm actual key name

let packer = createReliefPacker(1000); // ASSUMPTION: default budget cap
let citizenQueue = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log("e-Barangay Starter Kit Initialized. Happy Coding!");

  // 1. Load persisted queue from LocalStorage
  try {
    citizenQueue = loadQueueFromStorage(STORAGE_KEY) ?? [];
  } catch (err) {
    console.error('Failed to load queue from storage:', err);
    citizenQueue = [];
  }

  // 2. Fetch provinces and populate dropdown
  try {
    const provinces = await fetchProvinces();
    renderProvinceDropdown(provinces);
  } catch (err) {
    console.error('Failed to fetch provinces:', err);
  }

  // 3. Cascading province -> city dropdown
  const provinceSelect = document.getElementById('province-select'); // ASSUMPTION: element id
  if (provinceSelect) {
    provinceSelect.addEventListener('change', async (e) => {
      const provinceCode = e.target.value;
      try {
        const cities = await fetchCitiesByProvince(provinceCode);
        renderCityDropdown(cities);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    });
  }

  // 4. Eligibility form submission
  const eligibilityForm = document.getElementById('eligibility-form'); // ASSUMPTION: element id
  if (eligibilityForm) {
    eligibilityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const citizen = getFormValues(eligibilityForm); // ASSUMPTION: returns { isSenior, isPWD, monthlyIncome, dependentCount, ... }
      const result = evaluateAyudaEligibility(citizen);

      renderEligibilityResult(result);

      if (result.approved) {
        citizenQueue.push({ ...citizen, ...result });
        saveQueueToStorage(STORAGE_KEY, citizenQueue);
      }
    });
  }

  // 5. Relief goods packer (POS-style) setup
  const packerForm = document.getElementById('packer-form'); // ASSUMPTION: element id
  if (packerForm) {
    packerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('item-name');
      const priceInput = document.getElementById('item-price');
      const name = nameInput?.value?.trim();
      const price = parseFloat(priceInput?.value);

      const result = packer.addItem(name, price);
      if (!result.success) {
        console.warn('Could not add item:', result.reason);
      }

      renderPackerState({
        items: packer.getItems(),
        total: packer.getTotal(),
        cap: packer.getBudgetCap(),
      });

      packerForm.reset();
    });
  }

  // 6. Action delegation (e.g. remove item, remove queue entry) via a single listener
  document.addEventListener('click', (e) => {
    const removeItemBtn = e.target.closest('[data-action="remove-item"]'); // ASSUMPTION: data attribute contract
    if (removeItemBtn) {
      const index = Number(removeItemBtn.dataset.index);
      const result = packer.removeItem(index);
      if (result.success) {
        renderPackerState({
          items: packer.getItems(),
          total: packer.getTotal(),
          cap: packer.getBudgetCap(),
        });
      }
      return;
    }

    const removeQueueBtn = e.target.closest('[data-action="remove-queue-entry"]'); // ASSUMPTION
    if (removeQueueBtn) {
      const index = Number(removeQueueBtn.dataset.index);
      citizenQueue.splice(index, 1);
      saveQueueToStorage(STORAGE_KEY, citizenQueue);
      // re-render queue if there's a dedicated render function — not yet imported
    }
  });
});