export interface DeliveryDetails {
  recipient: string;
  phone: string;
  address: string;
  region: string;
  barangay: string;
  city: string;
  postalCode: string;
}

export type DeliveryField = keyof DeliveryDetails;
export type DeliveryFieldErrors = Partial<Record<DeliveryField, string>>;

const fieldLabels: Record<DeliveryField, string> = {
  recipient: 'Recipient name',
  phone: 'Phone number',
  address: 'Street address',
  region: 'Region',
  barangay: 'Barangay',
  city: 'City',
  postalCode: 'Postal code',
};

export function validateDeliveryDetails(details: DeliveryDetails): DeliveryFieldErrors {
  const errors: DeliveryFieldErrors = {};
  (Object.keys(fieldLabels) as DeliveryField[]).forEach((field) => {
    const value = details[field].trim();
    if (!value) {
      errors[field] = `${fieldLabels[field]} is required.`;
      return;
    }

    switch (field) {
      case 'recipient':
        if (value.length < 2 || !/\p{L}/u.test(value)) {
          errors.recipient = "Enter the recipient's full name.";
        }
        break;
      case 'phone': {
        const digitCount = value.replace(/\D/g, '').length;
        if (!/^[+\d\s().-]+$/.test(value) || digitCount < 7 || digitCount > 15) {
          errors.phone = 'Enter a valid phone number (7-15 digits).';
        }
        break;
      }
      case 'address':
        if (value.length < 5 || value.length > 120 || !/[\p{L}\p{N}]/u.test(value)) {
          errors.address = 'Enter a street address between 5 and 120 characters.';
        }
        break;
      case 'city':
        if (!/^[\p{L}][\p{L}\s.'-]{1,79}$/u.test(value)) {
          errors.city = 'Enter a valid city name.';
        }
        break;
      case 'region':
      case 'barangay':
        if (!/^[\p{L}][\p{L}\s.'()-]{1,99}$/u.test(value)) {
          errors[field] = `Select a valid ${fieldLabels[field].toLowerCase()}.`;
        }
        break;
      case 'postalCode':
        if (!/^[\p{L}\p{N}][\p{L}\p{N}\s-]{2,9}$/u.test(value)) {
          errors.postalCode = 'Enter a valid postal code (3-10 letters or numbers).';
        }
        break;
    }
  });
  return errors;
}
