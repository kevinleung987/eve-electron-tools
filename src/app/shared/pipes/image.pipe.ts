import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'image' })
export class ImagePipe implements PipeTransform {
  constructor() { }

  transform(value: any, valueType: any): string {
    if (value == null) {
      value = 1;
    }
    switch (valueType) {
      case 'character':
        return `https://image.eveonline.com/Character/${value}_64.jpg`;
      case 'corporation':
        return `https://image.eveonline.com/Corporation/${value}_64.png`;
      case 'alliance':
        return `https://image.eveonline.com/Alliance/${value}_64.png`;
      case 'ship':
        return `https://imageserver.eveonline.com/Render/${value}_64.png`;
      default:
        return null;
    }
  }
}
