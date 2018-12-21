import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public electron: ElectronService, public config: ConfigService) { }

  ngOnInit() { }

  writeConfig(config) {
    this.config.setConfig(config);
  }
}
