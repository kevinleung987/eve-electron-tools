import { Component, OnInit, ElementRef, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Input() source: any[];
  @Input() numSuggestions = 10;
  @Input() searchDelay = 250;
  @Output() submit: EventEmitter<string> = new EventEmitter();
  @Output() select: EventEmitter<string> = new EventEmitter();
  @Output() dirty: EventEmitter<boolean> = new EventEmitter();
  suggestions = [];
  searchValue = '';
  activeIndex = -1;

  @ViewChild('searchBar') searchBar: ElementRef;

  constructor(public suggest: SuggestionService) { }

  ngOnInit() {
    fromEvent(this.searchBar.nativeElement, 'input')
      .pipe(map((event: Event) => (<HTMLInputElement>event.target).value),
        debounceTime(this.searchDelay),
        distinctUntilChanged()
      ).subscribe(data => {
        this.activeIndex = -1;
        this.updateSuggestions();
        this.dirty.emit(false);
        this.select.emit('');
      });
  }

  makeDirty() {
    this.dirty.emit(true);
  }

  focusSearchBar() {
    this.searchBar.nativeElement.focus();
    this.searchBar.nativeElement.selectionStart = this.searchBar.nativeElement.selectionEnd = 10000;
  }

  stopEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  iterateSelectionDown() {
    if (this.activeIndex < this.suggestions.length - 1) {
      this.updateSelection(this.activeIndex + 1);
    } else if (this.suggestions.length > 0) {
      this.updateSelection(0);
    }
  }

  iterateSelectionUp() {
    if (this.activeIndex > 0) {
      this.updateSelection(this.activeIndex - 1);
    } else if (this.suggestions.length > 0) {
      this.updateSelection(this.suggestions.length - 1);
    }
  }

  onKeydown(event: KeyboardEvent, isSearchBar: boolean) {
    switch (event.key) {
      case 'ArrowDown':
      case 'Tab':
        this.iterateSelectionDown();
        this.stopEvent(event);
        break;
      case 'ArrowUp':
        this.iterateSelectionUp();
        this.stopEvent(event);
        break;
      case 'Enter':
        this.updateSelection(this.activeIndex);
        this.onSubmit();
        this.stopEvent(event);
        break;
      case 'Escape':
        this.searchValue = '';
        break;
    }
    if (!isSearchBar) {
      this.focusSearchBar();
    }
  }

  updateSuggestions() {
    if (this.searchValue == null) { return; }
    const suggestion = this.suggest.suggest(this.source, this.searchValue, this.numSuggestions);
    this.suggestions = suggestion ? suggestion : [];
  }

  updateSelection(index: number) {
    if (this.suggestions.length === 0) { return; }
    this.activeIndex = index >= 0 ? index : 0;
    this.searchValue = this.suggestions[this.activeIndex];
    this.select.emit(this.searchValue);
  }

  onSubmit() {
    this.submit.emit(this.activeIndex >= 0 ? this.searchValue : null);
  }
}
