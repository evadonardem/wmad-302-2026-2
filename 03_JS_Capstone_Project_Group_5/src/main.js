/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

import { createReliefPacker, evaluateAyudaEligibility } from './modules/engine.js';
import {
  fetchCitiesMunicipalities,
  fetchProvinces,
  getOfflineQueue,
  removeFromOfflineQueue,
  saveToOfflineQueue
} from './modules/async.js';
import { renderPOSRegister, renderResidentCards, setupActionDelegation } from './modules/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('#ayuda-form');
  const provinceSelect = document.querySelector('#prov-select');
  const citySelect = document.querySelector('#city-select');
  const queueContainer = document.querySelector('#queue-container');
  const posContainer = document.querySelector('#pos-container');
  const itemNameInput = document.querySelector('#item-name');
  const itemPriceInput = document.querySelector('#item-price');
  const addItemButton = document.querySelector('#add-item-btn');

  const reliefPacker = createReliefPacker(1000);

  const refreshQueue = () => {
    const currentQueue = getOfflineQueue();
    renderResidentCards(queueContainer, currentQueue);
  };

  const refreshPOS = () => {
    renderPOSRegister(posContainer, reliefPacker);
  };

  const populateProvinces = async () => {
    const provinces = await fetchProvinces();
    provinceSelect.innerHTML = '<option value="">Select Province...</option>' + provinces
      .map((province) => `<option value="${province.code}">${province.name}</option>`)
      .join('');
  };

  const populateCities = async (provinceCode) => {
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';

    if (!provinceCode) return;

    const cities = await fetchCitiesMunicipalities(provinceCode);
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>' + cities
      .map((city) => `<option value="${city.code}">${city.name}</option>`)
      .join('');
  };

  provinceSelect.addEventListener('change', (event) => {
    populateCities(event.target.value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const resident = {
      id: `${Date.now()}`,
      name: document.querySelector('#name').value.trim(),
      provinceCode: provinceSelect.value,
      cityCode: citySelect.value,
      city: citySelect.options[citySelect.selectedIndex]?.text || 'N/A',
      monthlyIncome: Number(document.querySelector('#monthly-income').value || 0),
      isSenior: document.querySelector('#is-senior').checked,
      isPWD: document.querySelector('#is-pwd').checked,
      dependentCount: Number(document.querySelector('#dependent-count').value || 0)
    };

    const evaluation = evaluateAyudaEligibility(resident);
    const application = {
      ...resident,
      ...evaluation,
      createdAt: new Date().toISOString()
    };

    saveToOfflineQueue(application);
    refreshQueue();
    form.reset();
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';
  });

  addItemButton.addEventListener('click', () => {
    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value);

    const result = reliefPacker.addItem(name, price);

    if (!result.success) {
      alert(result.reason);
      return;
    }

    itemNameInput.value = '';
    itemPriceInput.value = '';
    refreshPOS();
  });

  setupActionDelegation(queueContainer, {
    'remove-resident': (_event, target) => {
      const id = target.dataset.id;
      removeFromOfflineQueue(id);
      refreshQueue();
    }
  });

  setupActionDelegation(posContainer, {
    'remove-item': (_event, target) => {
      const index = Number(target.dataset.index);
      reliefPacker.removeItem(index);
      refreshPOS();
    }
  });

  refreshQueue();
  refreshPOS();
  await populateProvinces();
});