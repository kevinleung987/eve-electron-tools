import { Pipe, PipeTransform } from '@angular/core';
import { UniverseService } from 'src/app/services/universe.service';

@Pipe({ name: 'universe' })
export class UniversePipe implements PipeTransform {
  constructor(private universe: UniverseService) { }

  transform(value: any, valueType: any): string {
    if (value == null) {
      return 'None';
    }
    switch (valueType) {
      case 'item':
        return this.universe.getTypeName(value);
      case 'region':
        return this.universe.getRegionName(value);
      default:
        return null;
    }
  }
}
