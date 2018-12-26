import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
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
  searchItem = '';
  dirtyItem = false;
  currItem: number = null;
  searchRegion = '';
  dirtyRegion = false;
  currRegion: number = null;

  constructor(private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService,
    private config: ConfigService) {
    this.universe.waitUntilLoaded(() => {
      if (this.config.isDemo()) {
        this.searchItem = 'Ishtar';
        this.currItem = this.universe.getTypeId(this.searchItem);
      }
      this.searchRegion = 'The Forge';
      this.currRegion = this.universe.getRegionId(this.searchRegion);
    });

  }

  ngOnInit() { }

  onSubmitItem(event) {
    if (this.dirtyItem || event == null) { return; }
    this.searchItem = event;
    const submission = this.universe.getTypeId(this.searchItem);
    if (submission == null) { throw new Error('Bad search value submitted.'); }
    this.currItem = submission;
    this.alert.info(`${this.searchItem} [${submission.toString()}]`);
  }

  onSelectItem(event) {
    this.searchItem = event;
  }

  onDirtyItem(event) {
    this.dirtyItem = event;
  }

  onSubmitRegion(event) {
    if (this.dirtyRegion || event == null) { return; }
    this.searchRegion = event;
    const submission = this.universe.getRegionId(this.searchRegion);
    if (submission == null) { throw new Error('Bad search value submitted.'); }
    this.currRegion = submission;
    this.alert.info(`${this.searchRegion} [${submission.toString()}]`);
  }

  onSelectRegion(event) {
    this.searchRegion = event;
  }

  onDirtyRegion(event) {
    this.dirtyRegion = event;
  }
}
