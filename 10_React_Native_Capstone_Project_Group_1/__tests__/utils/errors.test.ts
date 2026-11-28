import { AxiosError } from 'axios';
import { getErrorMessage, getErrorStatus } from '@/utils/errors';

function axiosError(status: number | null, data?: unknown, code?: string): AxiosError {
  const error = new AxiosError('boom', code);
  if (status !== null) {
    error.response = { status, data, statusText: '', headers: {}, config: {} as never };
  }
  return error;
}

describe('errors', () => {
  it('prefers the API message', () => {
    expect(getErrorMessage(axiosError(400, { message: 'Invalid credentials' }))).toBe('Invalid credentials');
  });

  it('describes network problems and timeouts', () => {
    expect(getErrorMessage(axiosError(null))).toMatch(/network/i);
    expect(getErrorMessage(axiosError(null, undefined, 'ECONNABORTED'))).toMatch(/timed out/i);
  });

  it('falls back for other axios errors and plain errors', () => {
    expect(getErrorMessage(axiosError(500, {}), 'Fallback')).toBe('Fallback');
    expect(getErrorMessage(new Error('plain'))).toBe('plain');
    expect(getErrorMessage('???', 'Fallback')).toBe('Fallback');
  });

  it('extracts the status code', () => {
    expect(getErrorStatus(axiosError(404))).toBe(404);
    expect(getErrorStatus(new Error('x'))).toBeNull();
  });
});
