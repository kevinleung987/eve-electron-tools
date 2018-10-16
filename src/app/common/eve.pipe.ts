import { Pipe, PipeTransform } from '@angular/core';
import { EveService } from '../services/eve.service';

@Pipe({
  name: 'eve'
})
export class EvePipe implements PipeTransform {

  constructor(private eveService: EveService) { }

  transform(value: any, valueType: any): Promise<any> {
    if (valueType === 'alliance') {
      console.log(value, valueType);
      return this.eveService.alliances(value).then(result => result['name']);
    } else if (valueType === 'corporation') {
      return this.eveService.corporations(value).then(result => result['name']);
    } else {
      return null;
    }
  }

}
