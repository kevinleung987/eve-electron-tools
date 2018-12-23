import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';

import { LocalScanService } from '../../services/local-scan.service';

@Component({
  selector: 'app-local-scan',
  templateUrl: './local-scan.component.html',
  styleUrls: ['./local-scan.component.scss']
})
export class LocalScanComponent implements OnInit {
  constructor(private alert: AlertService, public local: LocalScanService) { }

  ngOnInit() { }

  onSubmit(input) {
    if (input == null || input.length === 0) {
      this.alert.warning('Please enter EVE character names into the Local Scan window.');
      return;
    }
    this.local.parse(input);
    this.alert.success('Started Local Scan...');
  }

  getDisplayCorporations() {
    const output = [];
    Object.keys(this.local.displayCorporations).forEach(element => {
      if (this.local.displayCorporations[element] != null) {
        output.push(this.local.displayCorporations[element]);
      }
    });
    output.sort(function (a, b) { return b.count - a.count; });
    return output;
  }

  getDisplayAlliances() {
    const output = [];
    Object.keys(this.local.displayAlliances).forEach(element => {
      if (this.local.displayAlliances[element] != null) {
        output.push(this.local.displayAlliances[element]);
      }
    });
    output.sort(function (a, b) { return b.count - a.count; });
    return output;
  }

  resetView() {
    this.local.displayCorporations = {};
    this.local.displayAlliances = {};
    this.alert.info('Results cleared.');
  }

  resetHighlight() {
    Object.keys(this.local.displayCorporations).forEach(element => {
      const corp = this.local.displayCorporations[element];
      if (corp != null) {
        corp.highlighted = false;
      }
    });
    Object.keys(this.local.displayAlliances).forEach(element => {
      const alliance = this.local.displayAlliances[element];
      if (alliance != null) {
        alliance.highlighted = false;
      }
    });
  }

  highlightCorporation(corp: any) {
    this.resetHighlight();
    corp.highlighted = true;
    if (corp.corporation.alliance) {
      const alliance = this.local.displayAlliances[corp.corporation.alliance];
      alliance.highlighted = true;
    }
  }

  highlightAlliance(alliance: any) {
    this.resetHighlight();
    alliance.highlighted = true;
    alliance.alliance.corporations.forEach(corp => {
      this.local.displayCorporations[corp].highlighted = true;
    });
  }
}
