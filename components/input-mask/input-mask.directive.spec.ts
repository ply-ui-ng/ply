import { applyInputMask, unmaskInputValue } from './input-mask.directive';

describe('applyInputMask', () => {
  it('masks phone digits with literals', () => {
    expect(applyInputMask('5551234567', '(000) 000-0000')).toBe('(555) 123-4567');
  });

  it('stops when input runs out', () => {
    expect(applyInputMask('55512', '(000) 000-0000')).toBe('(555) 12');
  });

  it('ignores non-digit characters for 0 tokens', () => {
    expect(applyInputMask('555-abc-1234', '(000) 000-0000')).toBe('(555) 123-4');
  });

  it('masks date pattern', () => {
    expect(applyInputMask('12252024', '00/00/0000')).toBe('12/25/2024');
  });

  it('masks letter and digit tokens', () => {
    expect(applyInputMask('abcd1234', 'AAAA-0000')).toBe('abcd-1234');
  });

  it('masks alphanumeric S tokens', () => {
    expect(applyInputMask('a1b2', 'SSSS')).toBe('a1b2');
  });

  it('returns value unchanged when pattern is empty', () => {
    expect(applyInputMask('hello', '')).toBe('hello');
  });
});

describe('unmaskInputValue', () => {
  it('strips phone literals', () => {
    expect(unmaskInputValue('(555) 123-4567', '(000) 000-0000')).toBe('5551234567');
  });

  it('strips date literals', () => {
    expect(unmaskInputValue('12/25/2024', '00/00/0000')).toBe('12252024');
  });
});
