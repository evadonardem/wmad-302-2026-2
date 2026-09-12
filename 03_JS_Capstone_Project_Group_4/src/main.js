/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

import { evaluateAyudaEligibility, createReliefPacker } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, setupActionDelegation } from './modules/dom.js';
import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
  removeFromOfflineQueue
} from './modules/async.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('e-Barangay Starter Kit Initialized. Happy Coding!');

  // --- DOM references (matched to actual index.html) ---
  const ayudaForm = document.getElementById('ayuda-form');
  const nameInput = document.getElementById('name');
  const provSelect = document.getElementById('prov-select');
  const citySelect = document.getElementById('city-select');
  const incomeInput = document.getElementById('monthly-income');
  const isSeniorCheckbox = document.getElementById('is-senior');
  const isPwdCheckbox = document.getElementById('is-pwd');
  const dependentCountInput = document.getElementById('dependent-count');

  const posContainer = document.getElementById('pos-container');
  const itemNameInput = document.getElementById('item-name');
  const itemPriceInput = document.getElementById('item-price');
  const addItemBtn = document.getElementById('add-item-btn');

  const queueContainer = document.getElementById('queue-container');

  const actionRoot = document.getElementById('app');

  // --- State ---
  let residents = getOfflineQueue(); // pre-load anything saved offline
  const packer = createReliefPacker(1000);

  // --- Initial renders ---
  renderResidentCards(queueContainer, residents);
  renderPOSRegister(posContainer, {
    items: packer.getItems(),
    subtotal: packer.getTotal(),
    budgetCap: packer.getBudgetCap()
  });

  // --- Load provinces (async, offline-fallback aware) ---
  const provinces = await fetchProvinces();
  provSelect.innerHTML =
    `<option value="">Select Province...</option>` +
    provinces.map(p => `<option value="${p.code}">${p.name}</option>`).join('');

  // --- Cascading province -> city dropdown ---
  provSelect.addEventListener('change', async () => {
    if (!provSelect.value) {
      citySelect.innerHTML = `<option value="">Select City/Municipality...</option>`;
      return;
    }

    citySelect.disabled = true;
    citySelect.innerHTML = `<option>Loading...</option>`;

    const cities = await fetchCitiesMunicipalities(provSelect.value);

    citySelect.innerHTML =
      `<option value="">Select City/Municipality...</option>` +
      cities.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    citySelect.disabled = false;
  });

  // --- Resident form submission ---
  ayudaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const citizen = {
      isSenior: isSeniorCheckbox.checked,
      isPWD: isPwdCheckbox.checked,
      monthlyIncome: Number(incomeInput.value) || 0,
      dependents: Number(dependentCountInput.value) || 0
    };

    const evaluation = evaluateAyudaEligibility(citizen);

    const application = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      province: provSelect.value,
      city: citySelect.value,
      ...evaluation
    };

    residents.push(application);
    saveToOfflineQueue(application);
    renderResidentCards(queueContainer, residents);

    ayudaForm.reset();
    citySelect.innerHTML = `<option value="">Select City/Municipality...</option>`;
  });

  // --- POS packer: add item ---
  addItemBtn.addEventListener('click', () => {
    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value) || 0;

    if (!name || price <= 0) return;

    const result = packer.addItem(name, price);

    if (!result.success) {
      alert(result.reason);
      return;
    }

    renderPOSRegister(posContainer, {
      items: packer.getItems(),
      subtotal: packer.getTotal(),
      budgetCap: packer.getBudgetCap()
    });

    itemNameInput.value = '';
    itemPriceInput.value = '';
  });

  // --- Action delegation: handles remove-resident and remove-item clicks ---
  setupActionDelegation(actionRoot, {
    'remove-resident': (dataset) => {
      residents = residents.filter(r => r.id !== dataset.id);
      removeFromOfflineQueue(dataset.id);
      renderResidentCards(queueContainer, residents);
    },
    'remove-item': (dataset) => {
      const index = packer.getItems().findIndex((_, i) => i.toString() === dataset.id);
      if (index !== -1) {
        packer.removeItem(index);
        renderPOSRegister(posContainer, {
          items: packer.getItems(),
          subtotal: packer.getTotal(),
          budgetCap: packer.getBudgetCap()
        });
      }
    }
  });
});
