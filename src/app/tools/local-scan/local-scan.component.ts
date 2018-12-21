import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

import { LocalScanService } from '../../services/local-scan.service';

@Component({
  selector: 'app-local-scan',
  templateUrl: './local-scan.component.html',
  styleUrls: ['./local-scan.component.scss']
})
export class LocalScanComponent implements OnInit {
  constructor(private alert: AlertService, public localScanService: LocalScanService) { }

  ngOnInit() { }

  onSubmit(input) {
    if (input == null || input.length === 0) {
      this.alert.warning('Please enter EVE character names into the Local Scan window.');
      return;
    }
    this.localScanService.parse(input);
    this.alert.success('Started Local Scan...');
  }

  getDisplayCorporations() {
    const keys = Object.keys(this.localScanService.displayCorporations);
    const output = [];
    keys.forEach(element => {
      if (this.localScanService.displayCorporations[element] != null) {
        output.push(this.localScanService.displayCorporations[element]);
      }
    });
    output.sort(function (a, b) { return b.count - a.count; });
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
    output.sort(function (a, b) { return b.count - a.count; });
    return output;
  }

  resetView() {
    this.localScanService.displayCorporations = {};
    this.localScanService.displayAlliances = {};
    this.alert.info('Results cleared.');
  }
}
