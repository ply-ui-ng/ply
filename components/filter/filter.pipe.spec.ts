import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array for null data', () => {
    expect(pipe.transform(null, 'test')).toEqual([]);
  });

  it('should return original data when filter is empty', () => {
    const data = ['a', 'b', 'c'];
    expect(pipe.transform(data, '')).toBe(data);
  });

  it('should filter string arrays case-insensitively', () => {
    const data = ['Apple', 'Banana', 'Cherry'];
    expect(pipe.transform(data, 'apple')).toEqual(['Apple']);
    expect(pipe.transform(data, 'BANANA')).toEqual(['Banana']);
  });

  it('should filter object arrays by single key', () => {
    const data = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];
    expect(pipe.transform(data, 'bob', 'name')).toEqual([{ name: 'Bob' }]);
  });

  it('should filter object arrays by multiple keys', () => {
    const data = [
      { first: 'John', last: 'Doe' },
      { first: 'Jane', last: 'Smith' }];
    expect(pipe.transform(data, 'doe', ['first', 'last'])).toEqual([
      { first: 'John', last: 'Doe' }]);
  });

  it('should search inside nested arrays', () => {
    const data = [{ tags: ['angular', 'typescript'] }, { tags: ['react', 'javascript'] }];
    expect(pipe.transform(data, 'angular', 'tags')).toEqual([
      { tags: ['angular', 'typescript'] }]);
  });
});
