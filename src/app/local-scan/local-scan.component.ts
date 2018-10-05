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
      output.push(this.localScanService.displayCorporations[element]);
    });
    return output;
  }

  getDisplayAlliances() {
    const keys = Object.keys(this.localScanService.displayAlliances);
    const output = [];
    keys.forEach(element => {
      output.push(this.localScanService.displayAlliances[element]);
    });
    return output;
  }

  resetView() {
    this.localScanService.displayCorporations = {};
    this.localScanService.displayAlliances = {};
  }
}
