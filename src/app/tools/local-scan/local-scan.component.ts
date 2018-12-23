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

  onSubmit(input: string) {
    if (input == null || input.length === 0) {
      this.alert.warning('Please enter EVE character names into the Local Scan window.');
      return;
    }
    this.alert.success('Started Local Scan...');
    this.local.parse(input);
  }

  resetView() {
    this.local.activeCorporations = {};
    this.local.activeAlliances = {};
    this.local.displayCorporations = [];
    this.local.displayAlliances = [];
    this.alert.info('Results cleared.');
  }

  resetHighlight() {
    this.local.displayCorporations.forEach(corp => {
      corp.highlighted = false;
    });
    this.local.displayAlliances.forEach(alliance => {
      alliance.highlighted = false;
    });
  }

  highlightCorporation(corp: any) {
    corp.highlighted = true;
    if (corp.corporation.alliance) {
      const alliance = this.local.activeAlliances[corp.corporation.alliance];
      alliance.highlighted = true;
    }
  }

  highlightAlliance(alliance: any) {
    alliance.highlighted = true;
    alliance.alliance.corporations.forEach(corp => {
      this.local.activeCorporations[corp].highlighted = true;
    });
  }
}
