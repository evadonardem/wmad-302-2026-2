import console from 'node:console';

// Task 1: Retry GCash Payment
export async function retryGcashPayment(paymentFn, retries = 3, delayMs = 50) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      // Try executing the payment function
      return await paymentFn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        // If all retries exhausted, rethrow the error
        throw err;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// Task 2: Run Tests
export async function runAsyncTests() {
  let attempts = 0;
  const failingFn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('Network Timeout');
    return 'SUCCESS';
  };

  const result = await retryGcashPayment(failingFn, 3, 10);
  console.assert(result === 'SUCCESS', 'Payment eventually succeeds on attempt 3');
  console.assert(attempts === 3, 'Took 3 attempts to succeed');
  console.log('  └─ Module 05 assertions passed.');
}
