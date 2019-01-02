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
      case 'system':
        return this.universe.getSystemName(value);
      case 'systemRegion':
        return this.universe.getRegionName(this.universe.getSystemRegion(value));
      case 'security':
        return this.universe.getSystemSecurity(value);
      case 'groupID':
        return this.universe.getTypeGroup(value).toString();
      case 'group':
        return this.universe.getGroupName(value);
      default:
        return 'None';
    }
  }
}
