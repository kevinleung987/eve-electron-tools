import { Component, OnInit } from '@angular/core';
import { LocalScanService } from '../services/local-scan.service';

@Component({
  selector: 'app-local-scan',
  templateUrl: './local-scan.component.html',
  styleUrls: ['./local-scan.component.scss']
})
export class LocalScanComponent implements OnInit {
  constructor(public localScanService: LocalScanService) { }

  ngOnInit() { }

  onSubmit(input) {
    this.localScanService.parse(input);
  }

  getDisplayCorporations() {
    const keys = Object.keys(this.localScanService.displayCorporations);
    const output = [];
    keys.forEach(element => {
      if (this.localScanService.displayCorporations[element] != null) {
        output.push(this.localScanService.displayCorporations[element]);
      }
    });
    output.sort(function (a, b) {
      return b.count - a.count;
    });
    return output;
  }

  getDisplayAlliances() {
    const keys = Object.keys(this.localScanService.displayAlliances);
    const output = [];
    keys.forEach(element => {
      if (this.localScanService.displayAlliances[element] != null) {
        output.push(this.localScanService.displayAlliances[element]);
      }
    });
    output.sort(function (a, b) {
      return b.count - a.count;
    });
    console.log(output);
    return output;
  }

  resetView() {
    this.localScanService.displayCorporations = {};
    this.localScanService.displayAlliances = {};
  }
}
