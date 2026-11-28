import { expect, it } from '@jest/globals';
import { validateDeliveryDetails } from './checkoutValidation';

it('flags each missing delivery field after trimming whitespace', () => {
  expect(validateDeliveryDetails({
    recipient: '  ',
    phone: '555-123-4567',
    address: '',
    region: '',
    barangay: '',
    city: 'Test City',
    postalCode: '',
  })).toEqual({
    recipient: 'Recipient name is required.',
    address: 'Street address is required.',
    region: 'Region is required.',
    barangay: 'Barangay is required.',
    postalCode: 'Postal code is required.',
  });
});

it('accepts a complete delivery address', () => {
  expect(validateDeliveryDetails({
    recipient: 'Test User',
    phone: '555-123-4567',
    address: '1 Test Street',
    region: 'National Capital Region',
    barangay: 'Barangay Test',
    city: 'Test City',
    postalCode: '12345',
  })).toEqual({});
});

it('explains which delivery details are invalid', () => {
  expect(validateDeliveryDetails({
    recipient: '7',
    phone: '12345',
    address: 'abc',
    region: '',
    barangay: '',
    city: '123',
    postalCode: '!',
  })).toEqual({
    recipient: "Enter the recipient's full name.",
    phone: 'Enter a valid phone number (7-15 digits).',
    address: 'Enter a street address between 5 and 120 characters.',
    region: 'Region is required.',
    barangay: 'Barangay is required.',
    city: 'Enter a valid city name.',
    postalCode: 'Enter a valid postal code (3-10 letters or numbers).',
  });
});
