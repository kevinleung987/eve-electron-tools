import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';
import { ConfigService } from 'src/app/services/config.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  readonly jumpCapable = [['JF/Rorqual', 10], ['Black Ops', 8], ['Carrier/Dread', 7], ['Super/Titan', 6]];
  systemA: number;
  systemB: number;
  routePreference = 'shorter';
  currDistance: string;
  currRoute: number[] = [];

  constructor(public config: ConfigService, private navigation: NavigationService, private universe: UniverseService,
    public suggest: SuggestionService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-navigation').bootstrapMaterialDesign();
    if (this.config.isDemo) {
      this.universe.waitUntilLoaded(() => {
        this.onSearch('Jita', 0);
        this.onSearch('Hakonen', 1);
      });
    }
  }

  onSearch(event, index) {
    if (index === 0) {
      this.systemA = this.universe.getSystemId(event);
    } else {
      this.systemB = this.universe.getSystemId(event);
    }
    if (this.systemA == null || this.systemB == null) { return; }
    const distance = this.navigation.getDistance(this.systemA, this.systemB);
    let capable = '';
    this.jumpCapable.forEach((shipType) => {
      if (shipType[1] >= distance) {
        capable = `${capable}${capable.length > 0 ? ', ' : ''}${shipType[0]}`;
      }
    });
    this.currDistance =
      `${new SlicePipe().transform(distance.toString(), 0, 4)} LY [${capable.length > 0 ? capable : 'None'}]`;
  }

  getRoute() {
    if (this.systemA == null || this.systemB == null) { return; }
    let route;
    switch (this.routePreference) {
      case 'shorter': route = this.navigation.getShortestRoute(this.systemA, this.systemB);
        break;
      case 'safer': route = this.navigation.getSafestRoute(this.systemA, this.systemB);
        break;
      case 'lessSecure': route = this.navigation.getLessSecureRoute(this.systemA, this.systemB);
        break;
    }
    this.currRoute = route;
    console.log(this.currRoute);
  }

  reset() {
    this.currDistance = null;
    this.systemA = null;
    this.systemB = null;
  }
}
