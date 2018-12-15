import { Component, ChangeDetectorRef } from '@angular/core';
import { UniverseService } from './services/universe.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private universe: UniverseService, private config: ConfigService, private changeDetector: ChangeDetectorRef) {
    this.config.configChanged.subscribe((newConfig) => {
      console.log('NEW CONFIG: ', newConfig);
      this.changeDetector.detectChanges();
    });
  }
}
