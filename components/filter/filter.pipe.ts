import { Pipe, PipeTransform } from '@angular/core';

/**
 * A generic data transformation pipe that filters an array of objects or strings based on a search term.
 * Capable of searching across multiple object properties recursively.
 * 
 * @example
 * <li *ngFor="let user of users | filter:searchQuery:['name', 'email']">
 */
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform<T>(
    data: T[] | null | undefined,
    filterValue: string,
    filterKeys?: string | string[]
  ): T[] {
    if (!data || !filterValue) {
      return data || [];
    }

    const lowerFilter = filterValue.toLowerCase();

    if (Array.isArray(filterKeys)) {
      return data.filter((item) => {
        return filterKeys.some((key) => {
          const propValue = (item as Record<string, unknown>)[key];
          return this.matches(propValue, lowerFilter);
        });
      });
    } else if (filterKeys) {
      return data.filter((item) => {
        const propValue = (item as Record<string, unknown>)[filterKeys];
        return this.matches(propValue, lowerFilter);
      });
    } else {
      return data.filter((item) => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(lowerFilter);
        }
        return false;
      });
    }
  }

  private matches(propValue: unknown, filterValue: string): boolean {
    if (!propValue) {
      return false;
    }

    if (Array.isArray(propValue)) {
      return propValue.some((val) =>
        String(val).toLowerCase().includes(filterValue)
      );
    }

    return String(propValue).toLowerCase().includes(filterValue);
  }
}
