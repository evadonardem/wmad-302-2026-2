/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

// TODO: Import required functions from engine.js, dom.js, and async.js
// TODO: Initialize DOM elements, load initial LocalStorage queue, fetch provinces, setup event listeners for form submission, cascading province/city dropdowns, POS packer, and action delegation.

import { evaluateAyudaEligibility, createReliefPacker } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, setupActionDelegation } from './modules/dom.js';
import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
  removeFromOfflineQueue
} from './modules/async.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("e-Barangay Starter Kit Initialized. Happy Coding!");

  const form = document.getElementById('ayuda-form');
  const provSelect = document.getElementById('prov-select');
  const citySelect = document.getElementById('city-select');
  const queueContainer = document.getElementById('queue-container');
  const posContainer = document.getElementById('pos-container');
  const addItemBtn = document.getElementById('add-item-btn');
  const itemNameInput = document.getElementById('item-name');
  const itemPriceInput = document.getElementById('item-price');

  let residents = getOfflineQueue();
  renderResidentCards(queueContainer, residents);

  const packer = createReliefPacker(1000);
  function refreshPOS() {
    renderPOSRegister(posContainer, {
      items: packer.getItems(),
      total: packer.getTotal(),
      budgetCap: packer.getBudgetCap()
    });
  }
  refreshPOS();

  const provinces = await fetchProvinces();
  provinces.forEach((prov) => {
    const option = document.createElement('option');
    option.value = prov.code;
    option.textContent = prov.name;
    provSelect.appendChild(option);
  });

  provSelect.addEventListener('change', async () => {
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';
    if (!provSelect.value) return;

    const cities = await fetchCitiesMunicipalities(provSelect.value);
    cities.forEach((city) => {
      const option = document.createElement('option');
      option.value = city.code;
      option.textContent = city.name;
      citySelect.appendChild(option);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const citizen = {
      monthlyIncome: Number(document.getElementById('monthly-income').value),
      isSenior: document.getElementById('is-senior').checked,
      isPWD: document.getElementById('is-pwd').checked,
      dependentCount: Number(document.getElementById('dependent-count').value)
    };

    const result = evaluateAyudaEligibility(citizen);

    const resident = {
      id: crypto.randomUUID(),
      name: document.getElementById('name').value.trim(),
      province: provSelect.options[provSelect.selectedIndex]?.textContent || '',
      city: citySelect.options[citySelect.selectedIndex]?.textContent || '',
      ...result
    };

    residents.push(resident);
    saveToOfflineQueue(resident);
    renderResidentCards(queueContainer, residents);

    form.reset();
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';
  });

  addItemBtn.addEventListener('click', () => {
    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value);
    if (!name || !price) return;

    const result = packer.addItem(name, price);
    if (!result.success) {
      alert(result.reason);
      return;
    }

    refreshPOS();
    itemNameInput.value = '';
    itemPriceInput.value = '';
  });

  setupActionDelegation(document.body, {
    'remove-resident': (target) => {
      const id = target.dataset.id;
      residents = residents.filter((r) => r.id !== id);
      removeFromOfflineQueue(id);
      renderResidentCards(queueContainer, residents);
    },
    'remove-item': (target) => {
      const index = Number(target.dataset.index);
      packer.removeItem(index);
      refreshPOS();
    }
  });
});