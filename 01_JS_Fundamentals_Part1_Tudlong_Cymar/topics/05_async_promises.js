import console from 'node:console';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryGcashPayment(paymentFn, retries = 3, delayMs = 50) {
  const maxAttempts = Math.max(1, retries); // assumption: `retries` = total attempts
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await paymentFn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(delayMs);
    }
  }

  throw lastError;
}

// runAsyncTests() stays unchanged