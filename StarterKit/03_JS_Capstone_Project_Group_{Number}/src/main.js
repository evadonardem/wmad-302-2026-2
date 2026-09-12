/**
 * [INTEGRATION] Main Entrypoint Module
 */

import {
  evaluateAyudaEligibility,
  createReliefPacker,
} from "./modules/engine.js";

import {
  renderResidentCards,
  renderPOSRegister,
  setupActionDelegation,
} from "./modules/dom.js";

import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
  removeFromOfflineQueue,
} from "./modules/async.js";


document.addEventListener("DOMContentLoaded", async () => {
  console.log("e-Barangay System Started");

  // =============================
  // DOM ELEMENTS
  // =============================

  const form = document.querySelector("#ayuda-form");

  const provinceSelect =
    document.querySelector("#prov-select");

  const citySelect =
    document.querySelector("#city-select");

  const queueContainer =
    document.querySelector("#queue-container");

  const posContainer =
    document.querySelector("#pos-container");

  const itemName =
    document.querySelector("#item-name");

  const itemPrice =
    document.querySelector("#item-price");

  const addItemButton =
    document.querySelector("#add-item-btn");


  // =============================
  // QUEUE
  // =============================

  let residents = getOfflineQueue();

  renderResidentCards(
    queueContainer,
    residents
  );


  // =============================
  // PROVINCES
  // =============================

  const provinces = await fetchProvinces();

  provinceSelect.innerHTML = `
    <option value="">Select Province...</option>
  `;

  provinces.forEach((province) => {
    const option = document.createElement("option");

    option.value = province.code;
    option.textContent = province.name;

    provinceSelect.appendChild(option);
  });


  // =============================
  // PROVINCE → CITY/MUNICIPALITY
  // =============================

  provinceSelect.addEventListener(
    "change",
    async () => {

      const provinceCode =
        provinceSelect.value;

      citySelect.innerHTML = `
        <option value="">Loading...</option>
      `;


      // If no province is selected
      if (!provinceCode) {

        citySelect.innerHTML = `
          <option value="">
            Select City/Municipality...
          </option>
        `;

        return;
      }


      // Get cities/municipalities
      const cities =
        await fetchCitiesMunicipalities(
          provinceCode
        );


      // Reset city dropdown
      citySelect.innerHTML = `
        <option value="">
          Select City/Municipality...
        </option>
      `;


      // Add cities/municipalities
      cities.forEach((city) => {

        const option =
          document.createElement("option");

        option.value =
          city.name;

        option.textContent =
          city.name;

        citySelect.appendChild(option);

      });

    }
  );


  // =============================
  // AYUDA FORM
  // =============================

  form.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();


      const name =
        document
          .querySelector("#name")
          .value
          .trim();


      const province =
        provinceSelect.options[
          provinceSelect.selectedIndex
        ].text;


      const city =
        citySelect.value;


      const monthlyIncome =
        Number(
          document.querySelector(
            "#monthly-income"
          ).value
        );


      const isSenior =
        document.querySelector(
          "#is-senior"
        ).checked;


      const isPWD =
        document.querySelector(
          "#is-pwd"
        ).checked;


      const dependentCount =
        Number(
          document.querySelector(
            "#dependent-count"
          ).value
        );


      // Citizen object
      const citizen = {
        name,
        province,
        city,
        monthlyIncome,
        isSenior,
        isPWD,
        dependentCount,
      };


      // =============================
      // CALCULATE ELIGIBILITY
      // =============================

      const result =
        evaluateAyudaEligibility(
          citizen
        );


      const application = {
        id: crypto.randomUUID(),

        ...citizen,

        ...result,

        createdAt:
          new Date().toISOString(),
      };


      // =============================
      // SAVE APPLICATION
      // =============================

      saveToOfflineQueue(
        application
      );


      // Update local array
      residents =
        getOfflineQueue();


      // Render residents
      renderResidentCards(
        queueContainer,
        residents
      );


      // Reset form
      form.reset();


      // Reset city dropdown
      citySelect.innerHTML = `
        <option value="">
          Select City/Municipality...
        </option>
      `;


      // Success message
      alert(
        `Application registered!\nPriority: ${result.priority}\nScore: ${result.score}`
      );

    }
  );


  // =============================
  // RELIEF PACKER
  // =============================

  const packer =
    createReliefPacker(1000);


  renderPOSRegister(
    posContainer,
    packer
  );


  // =============================
  // ADD ITEM
  // =============================

  addItemButton.addEventListener(
    "click",
    () => {

      const name =
        itemName.value.trim();


      const price =
        Number(
          itemPrice.value
        );


      const result =
        packer.addItem(
          name,
          price
        );


      if (!result.success) {

        alert(
          result.reason
        );

        return;
      }


      // Clear inputs
      itemName.value = "";
      itemPrice.value = "";


      // Update POS
      renderPOSRegister(
        posContainer,
        packer
      );

    }
  );


  // =============================
  // ACTION DELEGATION
  // =============================

  setupActionDelegation(
    queueContainer,
    {
      "remove-resident": (element) => {

        const id =
          element.dataset.id;


        removeFromOfflineQueue(
          id
        );


        residents =
          getOfflineQueue();


        renderResidentCards(
          queueContainer,
          residents
        );

      },
    }
  );


  // =============================
  // POS ACTION DELEGATION
  // =============================

  setupActionDelegation(
    posContainer,
    {
      "remove-item": (element) => {

        const index =
          Number(
            element.dataset.id
          );


        packer.removeItem(
          index
        );


        renderPOSRegister(
          posContainer,
          packer
        );

      },
    }
  );

});