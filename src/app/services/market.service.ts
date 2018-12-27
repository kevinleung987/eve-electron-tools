import { Injectable } from '@angular/core';
import { EveService } from 'src/app/services/eve.service';
import { UniverseService } from 'src/app/services/universe.service';
import { Price } from 'src/app/models/Market.model';

@Injectable({ providedIn: 'root' })
export class MarketService {
  constructor(private eve: EveService, private universe: UniverseService) {

  }

  async getPrices(item: number, region: number): Promise<Price> {
    const price = new Price();
    const orders = await this.eve.marketOrders(item, region);
    orders.forEach(order => {
      if (order['is_buy_order']) {
        price.buy.quantity += order['volume_remain'];
        price.buy.total += order['price'] * order['volume_remain'];
        if (order['price'] > price.buy.max) {
          price.buy.max = order['price'];
        } else if (order['price'] < price.buy.min) {
          price.buy.min = order['price'];
        }
      } else {
        price.sell.quantity += order['volume_remain'];
        price.sell.total += order['price'] * order['volume_remain'];
        if (order['price'] > price.sell.max) {
          price.sell.max = order['price'];
        } else if (order['price'] < price.sell.min) {
          price.sell.min = order['price'];
        }
      }
    });
    if (orders.length > 0) {
      price.buy.avg = price.buy.total / price.buy.quantity;
      price.sell.avg = price.sell.total / price.sell.quantity;
    }
    return Promise.resolve(price);
  }
}
