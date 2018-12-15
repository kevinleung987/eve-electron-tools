import { Pipe, PipeTransform } from '@angular/core';
import { EveService } from '../services/eve.service';

@Pipe({ name: 'eve' })
export class EvePipe implements PipeTransform {
  constructor(private eveService: EveService) { }

  transform(value: any, valueType: any): Promise<any> {
    switch (valueType) {
      case 'alliance':
        return this.eveService.alliances(value).then(result => result['name']);
      case 'corporation':
        return this.eveService.corporations(value)
          .then(result => result['name']);
      case 'character':
        return this.eveService.characters(value).then(result => result['name']);
      default:
        return null;
    }
  }
}
