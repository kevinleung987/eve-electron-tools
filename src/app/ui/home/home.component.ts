import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';

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
