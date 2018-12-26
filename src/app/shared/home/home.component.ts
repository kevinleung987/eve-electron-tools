import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public electron: ElectronService, public config: ConfigService, private alert: AlertService) { }

  ngOnInit() { }

  writeConfig(config) {
    this.config.setConfig(config);
  }

  toggleDemo(event: Event) {
    this.config.set('isDemo', !this.config.isDemo());
    console.log(this.config.getConfig());
    event.preventDefault();
    event.stopPropagation();
    this.alert.info(this.config.isDemo() ? 'Demo Mode Enabled, this may require a refresh if you have loaded any tools'
      : 'Demo Mode Disabled');
  }
}
