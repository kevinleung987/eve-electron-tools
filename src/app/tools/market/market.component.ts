import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UniverseService } from 'src/app/services/universe.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';


@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  readonly numSuggestions = 10;
  readonly searchDelay = 250;
  searchValue = '';
  dirty = false;

  constructor(private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService) { }

  ngOnInit() { }

  onSubmit(event) {
    if (this.dirty || event == null) { return; }
    this.searchValue = event;
    const submission = this.universe.getTypeId(this.searchValue);
    if (submission == null) { throw new Error('Bad search value submitted.'); }
    this.alert.info(`${this.searchValue} [${submission.toString()}]`);
  }

  onSelect(event) {
    this.searchValue = event;
  }

  onDirty(event) {
    this.dirty = event;
  }
}
