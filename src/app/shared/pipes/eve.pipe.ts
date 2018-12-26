import { Pipe, PipeTransform } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';
import { EveService } from 'src/app/services/eve.service';

@Pipe({ name: 'eve' })
export class EvePipe implements PipeTransform {
  constructor(private eveService: EveService, private electron: ElectronService) { }

  transform(value: any, valueType: any): Promise<any> {
    if (value == null) {
      return Promise.resolve({ name: 'None' });
    }
    switch (valueType) {
      case 'alliance':
        return this.eveService.alliances(value);
      case 'corporation':
        return this.eveService.corporations(value);
      case 'character':
        return this.eveService.characters(value);
      default:
        return null;
    }
  }
}
