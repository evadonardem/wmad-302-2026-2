/**
 * [INTEGRATION] Main Entrypoint Module - Student Starter Template
 */

import { evaluateAyudaEligibility, createReliefPacker, RELIEF_GOODS_CATALOG } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, renderReliefCatalog, setupActionDelegation } from './modules/dom.js';
import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
  removeFromOfflineQueue
} from './modules/async.js';

let residents = [];
let packer = createReliefPacker(1000);

document.addEventListener('DOMContentLoaded', async () => {
  console.log("e-Barangay Starter Kit Initialized. Happy Coding!");

  const residentForm = document.getElementById('ayuda-form');
  const fullNameInput = document.getElementById('name');
  const provinceSelect = document.getElementById('prov-select');
  const citySelect = document.getElementById('city-select');
  const monthlyIncomeInput = document.getElementById('monthly-income');
  const isSeniorInput = document.getElementById('is-senior');
  const isPwdInput = document.getElementById('is-pwd');
  const dependentsInput = document.getElementById('dependent-count');

  const queueContainer = document.getElementById('queue-container');
  const posContainer = document.getElementById('pos-container');
  const catalogContainer = document.getElementById('catalog-container');
  const eligibilityNotice = document.getElementById('eligibility-notice');
  const posWrapper = document.getElementById('pos-wrapper');

  // --- Initial state: packer hidden until a resident is evaluated ---
  eligibilityNotice.textContent = 'Register a resident first. The relief pack appears once eligibility is evaluated.';
  eligibilityNotice.style.display = 'block';
  posWrapper.style.display = 'none';

  // --- 1. Load offline queue on startup ---
  residents = getOfflineQueue();
  renderResidentCards(queueContainer, residents);

  // --- 2. Fetch provinces and populate dropdown ---
  const provinces = await fetchProvinces();
  provinceSelect.innerHTML = `<option value="">Select Province...</option>` +
    provinces.map(p => `<option value="${p.code}">${p.name}</option>`).join('');

  // --- 3. Cascading province -> city dropdown ---
  provinceSelect.addEventListener('change', async () => {
    const provinceCode = provinceSelect.value;
    citySelect.innerHTML = `<option value="">Loading...</option>`;

    if (!provinceCode) {
      citySelect.innerHTML = `<option value="">Select City/Municipality...</option>`;
      return;
    }

    const cities = await fetchCitiesMunicipalities(provinceCode);
    citySelect.innerHTML = `<option value="">Select City/Municipality...</option>` +
      cities.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
  });

  // --- 4. Relief Packer refresh helper ---
  function refreshPOS() {
    renderPOSRegister(posContainer, {
      items: packer.getItems(),
      budgetCap: packer.getBudgetCap()
    });
    renderReliefCatalog(catalogContainer, RELIEF_GOODS_CATALOG, packer);
  }

  // --- 5. Resident registration form submission ---
  residentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const citizen = {
      fullName: fullNameInput.value.trim(),
      province: provinceSelect.options[provinceSelect.selectedIndex]?.text || '',
      city: citySelect.options[citySelect.selectedIndex]?.text || '',
      isSenior: isSeniorInput.checked,
      isPWD: isPwdInput.checked,
      monthlyIncome: Number(monthlyIncomeInput.value) || 0,
      dependents: Number(dependentsInput.value) || 0,
    };

    if (!citizen.fullName) return;

    const eligibility = evaluateAyudaEligibility(citizen);
    const entry = saveToOfflineQueue({ ...citizen, ...eligibility });

    residents.push(entry);
    renderResidentCards(queueContainer, residents);
    residentForm.reset();

    if (eligibility.approved) {
      eligibilityNotice.style.display = 'none';
      posWrapper.style.display = 'block';
      refreshPOS();
    } else {
      eligibilityNotice.textContent = `Not eligible for relief pack (Priority: ${eligibility.priority}, Score: ${eligibility.score}).`;
      eligibilityNotice.style.display = 'block';
      posWrapper.style.display = 'none';
    }
  });

  // --- 6. Action delegation (remove-resident, remove-item, add-catalog-item) ---
  setupActionDelegation(document.body, {
    'remove-resident': (dataset) => {
      removeFromOfflineQueue(dataset.id);
      residents = residents.filter(r => r.id !== dataset.id);
      renderResidentCards(queueContainer, residents);
    },
    'remove-item': (dataset) => {
      const index = Number(dataset.index);
      if (!Number.isNaN(index)) {
        packer.removeItem(index);
        refreshPOS();
      }
    },
    'add-catalog-item': (dataset) => {
      const item = RELIEF_GOODS_CATALOG.find(g => g.id === dataset.id);
      if (!item) return;
      const result = packer.addItem(item.name, item.price);
      if (!result.success) {
        alert(result.reason);
        return;
      }
      refreshPOS();
    }
  });
});