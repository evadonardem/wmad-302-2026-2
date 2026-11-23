import { addAddress, removeAddress, setDefaultAddress, updateAddress } from '@/utils/addresses';
import type { Address } from '@/types/address';

const input = { label: ' Home ', street: ' 12 Session Road ', city: 'Baguio', postalCode: '2600' };

describe('address helpers', () => {
  it('makes the first address the default and trims text', () => {
    const list = addAddress([], 1, input, 'a1');
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'a1', userId: 1, label: 'Home', street: '12 Session Road', isDefault: true });
  });

  it('does not make later addresses the default', () => {
    const list = addAddress(addAddress([], 1, input, 'a1'), 1, { ...input, label: 'Work' }, 'a2');
    expect(list.map((a) => a.isDefault)).toEqual([true, false]);
  });

  it('updates an address by id', () => {
    const list = updateAddress(addAddress([], 1, input, 'a1'), 'a1', { ...input, city: 'Manila' });
    expect(list[0].city).toBe('Manila');
  });

  it('switches the default', () => {
    const base = addAddress(addAddress([], 1, input, 'a1'), 1, input, 'a2');
    const list = setDefaultAddress(base, 'a2');
    expect(list.find((a) => a.isDefault)?.id).toBe('a2');
  });

  it('promotes another address when the default is removed', () => {
    const base: Address[] = addAddress(addAddress([], 1, input, 'a1'), 1, input, 'a2');
    const list = removeAddress(base, 'a1');
    expect(list).toHaveLength(1);
    expect(list[0].isDefault).toBe(true);
  });

  it('removes a non-default address without changing the default', () => {
    const base = addAddress(addAddress([], 1, input, 'a1'), 1, input, 'a2');
    const list = removeAddress(base, 'a2');
    expect(list.map((a) => a.id)).toEqual(['a1']);
    expect(list[0].isDefault).toBe(true);
  });
});
