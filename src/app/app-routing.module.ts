import { Injectable, NgModule } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';

import { AlertService } from './services/alert.service';
import { ElectronService } from './services/electron.service';
import { DirectionalScanComponent } from './tools/directional-scan/directional-scan.component';
import { LocalScanComponent } from './tools/local-scan/local-scan.component';
import { MarketComponent } from './tools/market/market.component';
import { ProfileSyncComponent } from './tools/profile-sync/profile-sync.component';
import { VNICompanionComponent } from './tools/vni-companion/vni-companion.component';
import { ZkillListenerComponent } from './tools/zkill-listener/zkill-listener.component';
import { HomeComponent } from './ui/home/home.component';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean { return true; }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[route.routeConfig.path] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig) {
      return null;
    }
    return this.handlers[route.routeConfig.path];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}

@Injectable()
export class CanActivateElectron implements CanActivate {
  constructor(private electron: ElectronService, private alert: AlertService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.electron.isElectron) {
      this.alert.warning('This feature is only available in the Desktop client');
    }
    return this.electron.isElectron;
  }
}

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'local-scan', component: LocalScanComponent },
  { path: 'd-scan', component: DirectionalScanComponent },
  { path: 'market', component: MarketComponent },
  { path: 'zkill-listener', component: ZkillListenerComponent },
  { path: 'profile-sync', component: ProfileSyncComponent, canActivate: [CanActivateElectron] },
  { path: 'vni-companion', component: VNICompanionComponent, canActivate: [CanActivateElectron] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [CanActivateElectron], exports: [RouterModule]
})
export class AppRoutingModule {
}
