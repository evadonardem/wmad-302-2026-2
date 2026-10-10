import {
  evaluateAyudaEligibility,
  createReliefPacker
} from "./modules/engine.js";

import {
  renderResidentCards,
  renderPOSRegister,
  setupActionDelegation
} from "./modules/dom.js";

import {
  fetchProvinces,
  fetchCitiesMunicipalities,
  getOfflineQueue,
  saveToOfflineQueue,
  removeFromOfflineQueue
} from "./modules/async.js";


document.addEventListener("DOMContentLoaded", async () => {



  const form = document.getElementById("ayuda-form");
  const provinceSelect = document.getElementById("prov-select");
  const citySelect = document.getElementById("city-select");

  const queueContainer =
    document.getElementById("queue-container");

  const posContainer =
    document.getElementById("pos-container");

  const itemName =
    document.getElementById("item-name");

  const itemPrice =
    document.getElementById("item-price");

  const addItemButton =
    document.getElementById("add-item-btn");


  // Check if POS elements exist
  if (
    !posContainer ||
    !itemName ||
    !itemPrice ||
    !addItemButton
  ) {
    console.error("POS elements were not found in HTML.");
    return;
  }



  let residents = getOfflineQueue();

  renderResidentCards(
    queueContainer,
    residents
  );



  const reliefPacker = createReliefPacker(1000);

  renderPOSRegister(
    posContainer,
    reliefPacker
  );


  // Add item button
  addItemButton.addEventListener("click", () => {

    const name = itemName.value.trim();
    const price = Number(itemPrice.value);

    // Check input
    if (name === "") {
      alert("Please enter an item name.");
      return;
    }

    if (price <= 0 || isNaN(price)) {
      alert("Please enter a valid price.");
      return;
    }


    // Try adding item
    const result =
      reliefPacker.addItem(name, price);


    // If adding failed
    if (!result.success) {
      alert(result.reason);
      return;
    }


    // Clear inputs
    itemName.value = "";
    itemPrice.value = "";


    // Update POS display
    renderPOSRegister(
      posContainer,
      reliefPacker
    );

    console.log("Item added:", name, price);
  });



  try {

    const provinces = await fetchProvinces();

    provinces.forEach((province) => {

      const option =
        document.createElement("option");

      option.value = province.code;
      option.textContent = province.name;

      provinceSelect.appendChild(option);
    });

  } catch (error) {

    console.error(
      "Could not load provinces:",
      error
    );
  }



  provinceSelect.addEventListener(
    "change",
    async () => {

      const provinceCode =
        provinceSelect.value;

      citySelect.innerHTML =
        '<option value="">Select City/Municipality...</option>';

      if (!provinceCode) {
        return;
      }


      try {

        const cities =
          await fetchCitiesMunicipalities(
            provinceCode
          );


        cities.forEach((city) => {

          const option =
            document.createElement("option");

          option.value = city.name;
          option.textContent = city.name;

          citySelect.appendChild(option);
        });

      } catch (error) {

        console.error(
          "Could not load cities:",
          error
        );
      }
    }
  );



  form.addEventListener("submit", (e) => {

    e.preventDefault();


    const citizen = {

      name:
        document.getElementById("name").value,

      province:
        provinceSelect.options[
          provinceSelect.selectedIndex
        ].text,

      city:
        citySelect.value,

      monthlyIncome:
        Number(
          document.getElementById(
            "monthly-income"
          ).value
        ),

      isSenior:
        document.getElementById(
          "is-senior"
        ).checked,

      isPWD:
        document.getElementById(
          "is-pwd"
        ).checked,

      dependentCount:
        Number(
          document.getElementById(
            "dependent-count"
          ).value
        )
    };


    // Calculate score
    const result =
      evaluateAyudaEligibility(citizen);


    // Create application
    const application = {

      id: Date.now(),

      ...citizen,

      priority: result.priority,

      score: result.score,

      approved: result.approved
    };


    // Save
    saveToOfflineQueue(application);


    // Update queue
    residents =
      getOfflineQueue();


    renderResidentCards(
      queueContainer,
      residents
    );


    // Reset form
    form.reset();

    citySelect.innerHTML =
      '<option value="">Select City/Municipality...</option>';


    alert(
      `Application registered!\n` +
      `Priority: ${result.priority}\n` +
      `Score: ${result.score}`
    );
  });

  setupActionDelegation(
    document,
    {

      // Remove resident
      "remove-resident": (button) => {

        const id =
          Number(button.dataset.id);

        removeFromOfflineQueue(id);

        residents =
          getOfflineQueue();

        renderResidentCards(
          queueContainer,
          residents
        );
      },


      // Remove POS item
      "remove-item": (button) => {

        const index =
          Number(button.dataset.index);

        reliefPacker.removeItem(index);

        renderPOSRegister(
          posContainer,
          reliefPacker
        );
      }

    }
  );


  console.log(
    "e-Barangay system initialized."
  );

});