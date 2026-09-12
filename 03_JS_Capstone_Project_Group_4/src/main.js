<<<<<<< HEAD
import { evaluateAyudaEligibility, createReliefPacker } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, setupActionDelegation } from './modules/dom.js';
import { fetchProvinces, fetchCitiesMunicipalities, getOfflineQueue, saveToOfflineQueue, removeFromOfflineQueue } from './modules/async.js';
=======
/**
 * [INTEGRATION] Main Entrypoint Module
 * Wires together engine.js (Role A), dom.js (Role B), and async.js (Role C)
 * to match the e-Barangay Disaster & Ayuda Portal markup.
 */

<<<<<<< HEAD
import { evaluateAyudaEligibility, createReliefPacker } from './engine.js';

import {
  renderResidentCards,
  renderPOSRegister,
  setupActionDelegation,
} from './dom.js';

=======
import { evaluateAyudaEligibility, createReliefPacker } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, setupActionDelegation } from './modules/dom.js';
>>>>>>> ced2d70c9dd9d4d6e7844f2d65f66d8cc264e601
import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
<<<<<<< HEAD
  removeFromOfflineQueue,
} from './async.js';

// ---------------------------------------------------------------------------
// Element ids — matched to index.html
// ---------------------------------------------------------------------------
const EL = {
  ayudaForm: 'ayuda-form',
  nameInput: 'name',
  provinceSelect: 'prov-select',
  citySelect: 'city-select',
  monthlyIncomeInput: 'monthly-income',
  isSeniorCheckbox: 'is-senior',
  isPWDCheckbox: 'is-pwd',
  dependentCountInput: 'dependent-count',

  posContainer: 'pos-container',
  itemNameInput: 'item-name',
  itemPriceInput: 'item-price',
  addItemBtn: 'add-item-btn',

  queueContainer: 'queue-container',
  queueSearchInput: 'queue-search',
  queuePriorityFilter: 'queue-priority-filter',
  queueSortSelect: 'queue-sort',
};

// Higher rank = more urgent = sorts first
const PRIORITY_RANK = { CRITICAL: 3, HIGH: 2, LOW: 1 };

const BUDGET_CAP = 1000; // ASSUMPTION: default relief-goods budget cap; no cap input exists in the markup

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// packer.addItem/removeItem work by index, but the DOM removes items by id
// (data-action="remove-item" data-id="..."). itemIds mirrors the packer's
// internal items array 1:1 so an id can be translated back into an index.
const packer = createReliefPacker(BUDGET_CAP);
let itemIds = [];

let residentQueue = []; // in-memory mirror of the full offline queue (unfiltered, unsorted)

// Queue view state — search/filter/sort are applied on top of residentQueue
// without mutating it, so the underlying stored data is never lost.
const queueView = {
  searchTerm: '',
  priorityFilter: 'all', // 'all' | 'critical' | 'high' | 'low'
  sortMode: 'priority', // 'priority' | 'registered'
};

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function getVisibleQueue() {
  const term = queueView.searchTerm.trim().toLowerCase();

  let visible = residentQueue.filter((resident) => {
    const matchesSearch = !term || (resident.name ?? '').toLowerCase().includes(term);
    const matchesPriority =
      queueView.priorityFilter === 'all' ||
      (resident.priority ?? '').toLowerCase() === queueView.priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (queueView.sortMode === 'priority') {
    // Priority first (CRITICAL > HIGH > LOW), then longest-waiting first
    // within the same priority tier.
    visible = [...visible].sort((a, b) => {
      const rankDiff = (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return (b.waitMinutes ?? 0) - (a.waitMinutes ?? 0);
    });
  }
  // 'registered' mode: leave in the order getOfflineQueue() returned (registration order)

  return visible;
}

function renderQueue() {
  const container = document.getElementById(EL.queueContainer);
  renderResidentCards(container, getVisibleQueue());
}

function renderPacker() {
  const container = document.getElementById(EL.posContainer);
  const items = packer.getItems().map((item, i) => ({
    id: itemIds[i],
    name: item.name,
    price: item.price,
    qty: 1, // engine.js's packer has no quantity concept; always 1 per line
  }));
  renderPOSRegister(container, { items, budgetCap: packer.getBudgetCap() });
}

function generateId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Province / City cascading dropdowns
// (dom.js has no dropdown-render helper, so options are populated directly)
// ---------------------------------------------------------------------------

function populateSelect(selectEl, options, placeholderText) {
  if (!selectEl) return;
  selectEl.innerHTML = '';

  const placeholderOpt = document.createElement('option');
  placeholderOpt.value = '';
  placeholderOpt.textContent = placeholderText;
  selectEl.appendChild(placeholderOpt);

  options.forEach((opt) => {
    const optionEl = document.createElement('option');
    optionEl.value = opt.code;
    optionEl.textContent = opt.name;
    selectEl.appendChild(optionEl);
  });
}

async function initProvinceDropdown() {
  const provinceSelect = document.getElementById(EL.provinceSelect);
  const citySelect = document.getElementById(EL.citySelect);
  if (!provinceSelect) return;

  const provinces = await fetchProvinces();
  populateSelect(provinceSelect, provinces, 'Select Province...');

  provinceSelect.addEventListener('change', async (e) => {
    if (!citySelect) return;

    citySelect.disabled = true;
    populateSelect(citySelect, [], 'Loading...');

    const cities = await fetchCitiesMunicipalities(e.target.value);
    populateSelect(citySelect, cities, 'Select City/Municipality...');
    citySelect.disabled = false;
  });
}

// ---------------------------------------------------------------------------
// Ayuda registration form
// ---------------------------------------------------------------------------

function readAyudaForm() {
  const name = document.getElementById(EL.nameInput)?.value.trim() || 'Unnamed resident';
  const province = document.getElementById(EL.provinceSelect)?.value || '';
  const city = document.getElementById(EL.citySelect)?.value || '';
  const monthlyIncome = Number(document.getElementById(EL.monthlyIncomeInput)?.value) || 0;
  const isSenior = document.getElementById(EL.isSeniorCheckbox)?.checked || false;
  const isPWD = document.getElementById(EL.isPWDCheckbox)?.checked || false;
  const dependentCount = Number(document.getElementById(EL.dependentCountInput)?.value) || 0;

  return { name, province, city, monthlyIncome, isSenior, isPWD, dependentCount };
}

function resetAyudaForm(form) {
  form.reset();
  // Re-apply the placeholder state on the city dropdown since form.reset()
  // doesn't clear dynamically-injected <option>s.
  const citySelect = document.getElementById(EL.citySelect);
  if (citySelect) populateSelect(citySelect, [], 'Select City/Municipality...');
}

function initAyudaForm() {
  const form = document.getElementById(EL.ayudaForm);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const citizen = readAyudaForm();
    const result = evaluateAyudaEligibility(citizen);

    const record = {
      id: generateId(),
      name: citizen.name,
      province: citizen.province,
      city: citizen.city,
      waitMinutes: 0,
      priority: result.priority,
      score: result.score,
      approved: result.approved,
      monthlyIncome: citizen.monthlyIncome,
      dependentCount: citizen.dependentCount,
      isSenior: citizen.isSenior,
      isPWD: citizen.isPWD,
    };

    if (result.approved) {
      saveToOfflineQueue(record);
      residentQueue = getOfflineQueue();
      renderQueue();
      resetAyudaForm(form);
    } else {
      // ASSUMPTION: no "rejected" UI exists in the markup, so this is
      // surfaced via alert. Swap in a proper message element if desired.
      alert(`Not approved for Ayuda. Score: ${result.score} (${result.priority} priority).`);
    }
  });
}

// ---------------------------------------------------------------------------
// Relief goods packer (POS register)
// ---------------------------------------------------------------------------

function initPackerControls() {
  const addBtn = document.getElementById(EL.addItemBtn);
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    const nameInput = document.getElementById(EL.itemNameInput);
    const priceInput = document.getElementById(EL.itemPriceInput);
    const name = nameInput?.value.trim();
    const price = parseFloat(priceInput?.value);

    const result = packer.addItem(name, price);

    if (!result.success) {
      alert(`Could not add item: ${result.reason}`);
      return;
    }

    itemIds.push(generateId());
    renderPacker();

    nameInput.value = '';
    priceInput.value = '';
    nameInput.focus();
  });
}

// ---------------------------------------------------------------------------
// Queue search / filter / sort controls
// ---------------------------------------------------------------------------

function initQueueControls() {
  const searchInput = document.getElementById(EL.queueSearchInput);
  const priorityFilter = document.getElementById(EL.queuePriorityFilter);
  const sortSelect = document.getElementById(EL.queueSortSelect);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      queueView.searchTerm = e.target.value;
      renderQueue();
    });
  }

  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      queueView.priorityFilter = e.target.value;
      renderQueue();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      queueView.sortMode = e.target.value;
      renderQueue();
    });
  }
}

// ---------------------------------------------------------------------------
// Delegated click actions (resident removal, packer item removal)
// ---------------------------------------------------------------------------

function initActionDelegation() {
  setupActionDelegation(document.body, {
    'remove-resident': (el) => {
      const id = el.dataset.id;
      removeFromOfflineQueue(id);
      residentQueue = getOfflineQueue();
      renderQueue();
    },
    'remove-item': (el) => {
      const id = el.dataset.id;
      const index = itemIds.indexOf(id);
      if (index === -1) return;

      const result = packer.removeItem(index);
      if (result.success) {
        itemIds.splice(index, 1);
        renderPacker();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  console.log('e-Barangay Starter Kit Initialized. Happy Coding!');

  // Load persisted resident queue
  residentQueue = getOfflineQueue();
  renderQueue();

  // Empty packer state on load
  renderPacker();

  // Wire up everything else
  await initProvinceDropdown();
  initAyudaForm();
  initPackerControls();
  initActionDelegation();
  initQueueControls();
});
=======
  removeFromOfflineQueue
} from './modules/async.js';
>>>>>>> 96ae72101b9c516f0927a950a5aad4b82042a815

document.addEventListener('DOMContentLoaded', async () => {
  const ayudaForm = document.getElementById('ayuda-form');
  const provSelect = document.getElementById('prov-select');
  const citySelect = document.getElementById('city-select');
  const posContainer = document.getElementById('pos-container');
  const queueContainer = document.getElementById('queue-container');

  let residents = getOfflineQueue();
  const packer = createReliefPacker(1000);

  const updatePOS = () => renderPOSRegister(posContainer, {
    items: packer.getItems(),
    subtotal: packer.getTotal(),
    budgetCap: packer.getBudgetCap()
  });

  renderResidentCards(queueContainer, residents);
  updatePOS();

  // Load provinces
  const provinces = await fetchProvinces();
  provSelect.innerHTML = `<option value="">Select Province...</option>` +
    provinces.map(p => `<option value="${p.code}">${p.name}</option>`).join('');

  // Province change handler
  provSelect.addEventListener('change', async () => {
    if (!provSelect.value) return citySelect.innerHTML = `<option value="">Select City/Municipality...</option>`;
    citySelect.disabled = true;
    const cities = await fetchCitiesMunicipalities(provSelect.value);
    citySelect.innerHTML = `<option value="">Select City/Municipality...</option>` +
      cities.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
    citySelect.disabled = false;
  });

  // Add resident
  ayudaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const evaluation = evaluateAyudaEligibility({
      isSenior: document.getElementById('is-senior').checked,
      isPWD: document.getElementById('is-pwd').checked,
      monthlyIncome: Number(document.getElementById('monthly-income').value) || 0,
      dependents: Number(document.getElementById('dependent-count').value) || 0
    });

    const application = {
      id: Date.now().toString(),
      name: document.getElementById('name').value.trim(),
      province: provSelect.value,
      city: citySelect.value,
      ...evaluation
    };

    residents.push(application);
    saveToOfflineQueue(application);
    renderResidentCards(queueContainer, residents);
    ayudaForm.reset();
  });

  // POS add item
  document.getElementById('add-item-btn').addEventListener('click', () => {
    const itemInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    const result = packer.addItem(itemInput.value.trim(), Number(priceInput.value) || 0);

    if (!result.success) return alert(result.reason);

    updatePOS();
    itemInput.value = '';
    priceInput.value = '';
  });

  // Action delegation
  setupActionDelegation(document.getElementById('app'), {
    'remove-resident': ({ id }) => {
      residents = residents.filter(r => r.id !== id);
      removeFromOfflineQueue(id);
      renderResidentCards(queueContainer, residents);
    },
    'remove-item': ({ id }) => {
      packer.removeItem(Number(id));
      updatePOS();
    }
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> ced2d70c9dd9d4d6e7844f2d65f66d8cc264e601
>>>>>>> 96ae72101b9c516f0927a950a5aad4b82042a815
