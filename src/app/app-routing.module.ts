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
import { AlertService } from 'src/app/services/alert.service';
import { ElectronService } from 'src/app/services/electron.service';
import { HomeComponent } from 'src/app/shared/home/home.component';
import { DirectionalScanComponent } from 'src/app/tools/directional-scan/directional-scan.component';
import { LocalScanComponent } from 'src/app/tools/local-scan/local-scan.component';
import { MarketComponent } from 'src/app/tools/market/market.component';
import { NavigationComponent } from 'src/app/tools/navigation/navigation.component';
import { ProfileSyncComponent } from 'src/app/tools/profile-sync/profile-sync.component';
import { VNICompanionComponent } from 'src/app/tools/vni-companion/vni-companion.component';
import { ZkillListenerComponent } from 'src/app/tools/zkill-listener/zkill-listener.component';

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
      this.alert.warning('This feature is only available in the Desktop client, you can download it from the GitHub Releases page.');
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
  { path: 'navigation', component: NavigationComponent },
  { path: 'profile-sync', component: ProfileSyncComponent, canActivate: [CanActivateElectron] },
  { path: 'vni-companion', component: VNICompanionComponent, canActivate: [CanActivateElectron] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [CanActivateElectron], exports: [RouterModule]
})
export class AppRoutingModule {
}
