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
  activeIndex = -1;
  @ViewChild('searchBar') searchBar: ElementRef;
  constructor(public universe: UniverseService, public match: MatchService) { }

  ngOnInit() {
    fromEvent(this.searchBar.nativeElement, 'input')
      .pipe(map((event: Event) => (<HTMLInputElement>event.target).value),
        debounceTime(200),
        distinctUntilChanged()
      ).subscribe(data => this.search());
  }

  search() {
    this.items = this.match.autoComplete(this.searchValue, 10);
  }

  activate(index) {
    this.activeIndex = index;
  }

  onKeydown(event) {
    if (event.key === 'ArrowDown') {
      if (this.activeIndex < this.items.length - 1) {
        this.activeIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      if (this.activeIndex > 0) {
        this.activeIndex--;
      }
    } else if (event.key === 'Enter' || event.key === 'ArrowRight') {
      this.searchValue = this.items[this.activeIndex];
    }
  }

  submit() {
    console.log(this.searchValue);
  }
}
