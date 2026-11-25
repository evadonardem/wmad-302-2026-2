import axios from 'axios';

export function getFriendlyRequestError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Check your internet connection and try again.';

    switch (error.response.status) {
      case 400:
      case 422:
        return 'Some checkout details are not valid. Check your delivery information and try again.';
      case 404:
        return 'We could not find a product or delivery option. Check your cart and address, then try again.';
      default:
        if (error.response.status >= 500) {
          return 'Checkout is temporarily unavailable. Please try again in a moment.';
        }
        return fallback;
    }
  }

  if (error instanceof Error && !/^Request failed with status code \d+$/.test(error.message)) {
    return error.message;
  }
  return fallback;
}
