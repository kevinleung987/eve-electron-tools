import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { LocalScanService } from 'src/app/services/local-scan.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-local-scan',
  templateUrl: './local-scan.component.html',
  styleUrls: ['./local-scan.component.scss']
})
export class LocalScanComponent implements OnInit {
  placeholder = this.config.isDemo() ? environment.localScanPlaceholder : null;
  parallel = false;
  @ViewChild('localInput') localInput;

  constructor(public config: ConfigService, private alert: AlertService, public local: LocalScanService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-local-scan').bootstrapMaterialDesign();
  }

  onSubmit(input: string) {
    if (input == null || input.length === 0) {
      this.alert.warning('Please enter EVE character names into the Local Scan window.');
      return;
    }
    this.parallel ? this.alert.success('Started Parallel Local Scan...') : this.alert.success('Started Local Scan...');
    this.local.parse(input, this.parallel);
  }

  resetView() {
    this.local.reset();
    this.placeholder = '';
    this.localInput.value = '';
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
      this.highlightAlliance(this.local.activeAlliances[corp.corporation.alliance]);
    }
  }

  highlightAlliance(alliance: any) {
    alliance.highlighted = true;
    alliance.alliance.corporations.forEach(corp => {
      this.local.activeCorporations[corp].highlighted = true;
    });
  }
}
