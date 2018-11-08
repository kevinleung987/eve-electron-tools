import {Component} from '@angular/core';
import {UniverseService} from './services/universe.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public universe: UniverseService) {}
}
