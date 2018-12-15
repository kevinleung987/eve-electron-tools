import { Component } from '@angular/core';
import { UniverseService } from './services/universe.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private universe: UniverseService, private config: ConfigService) { }
}
