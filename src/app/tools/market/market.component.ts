import { Component, OnInit } from '@angular/core';
import { Price } from 'src/app/models/Market.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { MarketService } from 'src/app/services/market.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';


@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  readonly numSuggestions = 10;
  readonly searchDelay = 250;
  currItem: number = null;
  currRegion: number = null;
  currPrice: Price;

  constructor(private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService,
    private config: ConfigService, private market: MarketService) {
    this.universe.waitUntilLoaded(() => {
      if (this.config.isDemo()) {
        this.currItem = this.universe.getTypeId('Ishtar');
      }
      this.currRegion = this.universe.getRegionId('The Forge');
      this.updatePrice();
    });

  }

  ngOnInit() { }

  onSubmitItem(event) {
    if (event == null) { return; }
    const submission = this.universe.getTypeId(event);
    if (submission == null) { throw new Error('Bad search value submitted.'); }
    this.currItem = submission;
    this.alert.info(`${event} [${submission.toString()}]`);
    this.updatePrice();
  }

  onSubmitRegion(event) {
    if (event == null) { return; }
    const submission = this.universe.getRegionId(event);
    if (submission == null) { throw new Error('Bad search value submitted.'); }
    this.currRegion = submission;
    this.alert.info(`${event} [${submission.toString()}]`);
    this.updatePrice();
  }

  updatePrice() {
    if (this.currItem && this.currRegion) {
      this.market.getPrices(this.currItem, this.currRegion).then((result) => {
        this.currPrice = result;
      });
    }
  }
}
