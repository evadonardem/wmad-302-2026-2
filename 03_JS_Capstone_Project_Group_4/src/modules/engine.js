export function evaluateAyudaEligibility(citizen) {
  const {
    isSenior = false,
    isPWD = false,
    monthlyIncome = Infinity,
    dependentCount,
  } = citizen ?? {};

  let score = 0;

  if (isSenior === true) score += 35;
  if (isPWD === true) score += 35;
  if (monthlyIncome < 10000) score += 20;

  const dependents = Math.max(0, dependentCount ?? 0);
  const dependentPoints = Math.min(dependents * 5, 20);
  score += dependentPoints;

  let priority;
  let approved;

  if (score >= 70) {
    priority = 'CRITICAL';
    approved = true;
  } else if (score >= 40) {
    priority = 'HIGH';
    approved = true;
  } else {
    priority = 'LOW';
    approved = false;
  }

  return { priority, score, approved };
}

export function createReliefPacker(budgetCap = 1000) {
  const items = [];

  function getTotal() {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  function addItem(name, price) {
    if (typeof name !== 'string' || typeof price !== 'number' || price < 0) {
      return { success: false, reason: "Invalid name or price" };
    }

    if (getTotal() + price > budgetCap) {
      return { success: false, reason: "Exceeds budget cap" };
    }

    items.push({ name, price });
    return { success: true };
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) {
      return { success: false, reason: "Invalid index" };
    }
    items.splice(index, 1);
    return { success: true };
  }

  function getItems() {
    return items.map((item) => ({ ...item }));
  }

  function getBudgetCap() {
    return budgetCap;
  }

  return {
    addItem,
    removeItem,
    getTotal,
    getItems,
    getBudgetCap,
  };
}

export function createPOSRegister(budgetCap = 1000) {
  const packer = createReliefPacker(budgetCap);
  const registeredApplicants = new Map();

  async function registerApplicant(registrationCallback) {
    try {
      const applicantData = await registrationCallback();

      if (!applicantData || !applicantData.id) {
        return {
          status: 'REJECTED',
          reason: 'Invalid applicant details or missing ID.',
        };
      }

      const evaluation = evaluateAyudaEligibility(applicantData);
      const record = {
        ...applicantData,
        evaluation,
        registeredAt: new Date(),
      };

      registeredApplicants.set(applicantData.id, record);

      if (!evaluation.approved) {
        return {
          status: 'DENIED',
          reason: `Failed qualification criteria. Score: ${evaluation.score} (${evaluation.priority} Priority)`,
          evaluation,
        };
      }

      return {
        status: 'APPROVED',
        applicantId: applicantData.id,
        evaluation,
      };
    } catch (error) {
      return {
        status: 'ERROR',
        reason: error.message || 'Registration failed unexpectedly.',
      };
    }
  }

  function checkout(applicantId) {
    const applicant = registeredApplicants.get(applicantId);

    if (!applicant) {
      return { success: false, reason: 'Applicant not found in register.' };
    }

    if (!applicant.evaluation.approved) {
      return { success: false, reason: 'Applicant is not eligible for distribution.' };
    }

    const cart = packer.getItems();
    const totalSpent = packer.getTotal();

    if (cart.length === 0) {
      return { success: false, reason: 'Relief pack is empty.' };
    }

    return {
      success: true,
      transaction: {
        applicantId: applicant.id,
        name: applicant.name,
        priority: applicant.evaluation.priority,
        score: applicant.evaluation.score,
        items: cart,
        total: totalSpent,
        remainingBudget: packer.getBudgetCap() - totalSpent,
      },
    };
  }

  return {
    packer,
    registerApplicant,
    checkout,
    getApplicantRecord: (id) => registeredApplicants.get(id),
  };
}