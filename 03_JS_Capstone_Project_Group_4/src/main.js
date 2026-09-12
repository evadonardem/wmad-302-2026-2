import { evaluateAyudaEligibility, createReliefPacker } from './modules/engine.js';
import { renderResidentCards, renderPOSRegister, setupActionDelegation } from './modules/dom.js';
import { fetchProvinces, fetchCitiesMunicipalities, getOfflineQueue, saveToOfflineQueue, removeFromOfflineQueue } from './modules/async.js';

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
});