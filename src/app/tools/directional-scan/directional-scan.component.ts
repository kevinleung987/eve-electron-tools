import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dscan',
  templateUrl: './directional-scan.component.html',
  styleUrls: ['./directional-scan.component.scss']
})
export class DirectionalScanComponent implements OnInit {

  placeholder = environment.dScanPlaceholder;
  busy = false;
  results: { [name: string]: { typeId: number, count: number } } = {};
  display: { name: string, typeId: number, count: number }[] = [];
  constructor(private alert: AlertService, private universe: UniverseService) { }

  ngOnInit() { }

  onSubmit(input: string) {
    if (input == null || input.length === 0) {
      this.alert.warning('Please enter EVE character names into the Local Scan window.');
      return;
    }
    this.parse(input);
  }

  parse(input: string) {
    this.busy = true;
    const lines = input.split('\n');
    lines.forEach((line) => {
      const result = this.parseLine(line);
      if (result == null) { return; }
      if (this.results[result]) {
        this.results[result].count++;
      } else {
        this.results[result] = { typeId: this.universe.getTypeId(result), count: 1 };
      }
    });
    console.log(this.results);
    Object.keys(this.results).forEach((item) => {
      const displayItem = { ... this.results[item], name: item };
      this.display.push(displayItem);
    });
    this.display.sort(function (a, b) { return b.count - a.count; });
    console.log(this.display);
    this.busy = false;
  }

  parseLine(line: string) {
    const tokens = line.split('\t');
    if (tokens.length !== 4) { return null; }
    return tokens[2];
  }

  reset() {
    this.results = {};
    this.display = [];
  }
}

