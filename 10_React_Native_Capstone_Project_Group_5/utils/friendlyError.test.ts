import axios from 'axios';
import { expect, it } from '@jest/globals';
import { getFriendlyRequestError } from './friendlyError';

it('translates common checkout API failures into actionable messages', () => {
  const notFound = new axios.AxiosError('Request failed with status code 404', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 404,
    statusText: 'Not Found',
    headers: {},
    config: { headers: new axios.AxiosHeaders() },
  });

  expect(getFriendlyRequestError(notFound, 'Please try again.')).toMatch(/check your cart and address/i);
});

it('uses a friendly fallback for unrecognized HTTP status errors', () => {
  const failure = new axios.AxiosError('Request failed with status code 403', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status: 403,
    statusText: 'Forbidden',
    headers: {},
    config: { headers: new axios.AxiosHeaders() },
  });

  expect(getFriendlyRequestError(failure, 'Please try again.')).toBe('Please try again.');
});
