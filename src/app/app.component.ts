import { ChangeDetectorRef, Component } from '@angular/core';

import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { UniverseService } from 'src/app/services/universe.service';
import { SuggestionService } from 'src/app/services/suggestion.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private electron: ElectronService, private universe: UniverseService,
    private config: ConfigService, private suggest: SuggestionService, private changeDetector: ChangeDetectorRef) {
    // Watches for updates to state that occur in Electron-land and
    // signals Angular re-render the view.
    this.electron.updateOccured.subscribe((reason) => {
      console.log('Manual view update because of:', reason);
      this.changeDetector.detectChanges();
    });
    console.log(this.config.isDemo);
  }
}
