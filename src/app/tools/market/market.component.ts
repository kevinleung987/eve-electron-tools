import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UniverseService } from 'src/app/services/universe.service';
import { MatchService } from 'src/app/services/match.service';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  items = [];
  searchValue = '';
  @ViewChild('searchBar') searchBar: ElementRef;
  constructor(public universe: UniverseService, public match: MatchService) { }

  ngOnInit() {
    fromEvent(this.searchBar.nativeElement, 'input')
      .pipe(map((event: Event) => (<HTMLInputElement>event.target).value),
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(data => this.search());
  }

  search() {
    this.items = this.match.autoComplete(this.searchValue, 5);
  }
}
