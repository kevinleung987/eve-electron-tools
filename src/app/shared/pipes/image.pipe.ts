import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'image' })
export class ImagePipe implements PipeTransform {
  constructor() { }

  transform(value: any, valueType: any, size: number): string {
    if (value == null) {
      value = 1;
    }
    if (size == null) {
      size = 64;
    }
    switch (valueType) {
      case 'character':
        return `https://image.eveonline.com/Character/${value}_${size}.jpg`;
      case 'corporation':
        return `https://image.eveonline.com/Corporation/${value}_${size}.png`;
      case 'alliance':
        return `https://image.eveonline.com/Alliance/${value}_${size}.png`;
      case 'ship':
        return `https://imageserver.eveonline.com/Render/${value}_${size}.png`;
      default:
        return null;
    }
  }
}
