import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';

import { LocalScanComponent } from './tools/local-scan/local-scan.component';
import { MarketComponent } from './tools/market/market.component';
import { ProfileSyncComponent } from './tools/profile-sync/profile-sync.component';
import { ZkillListenerComponent } from './tools/zkill-listener/zkill-listener.component';
import { HomeComponent } from './ui/home/home.component';
import { DirectionalScanComponent } from './tools/directional-scan/directional-scan.component';
import { VNICompanionComponent } from './tools/vni-companion/vni-companion.component';

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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'local-scan', component: LocalScanComponent },
  { path: 'd-scan', component: DirectionalScanComponent },
  { path: 'market', component: MarketComponent },
  { path: 'zkill-listener', component: ZkillListenerComponent },
  { path: 'profile-sync', component: ProfileSyncComponent },
  { path: 'vni-companion', component: VNICompanionComponent },
];

@NgModule({ imports: [RouterModule.forRoot(routes, { useHash: true })], exports: [RouterModule] })
export class AppRoutingModule {
}
