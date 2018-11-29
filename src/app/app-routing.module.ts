import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LocalScanComponent} from './tools/local-scan/local-scan.component';
import {MarketComponent} from './tools/market/market.component';
import {HomeComponent} from './ui/home/home.component';
import {
  ZkillListenerComponent
} from './tools/zkill-listener/zkill-listener.component';

import {
  RouteReuseStrategy,
  DetachedRouteHandle,
  ActivatedRouteSnapshot
} from '@angular/router';
import {
  ProfileSyncComponent
} from './tools/profile-sync/profile-sync.component';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: {[key: string]: DetachedRouteHandle} = {};

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
  {path: '', component: HomeComponent},
  {path: 'local-scan', component: LocalScanComponent},
  {path: 'market', component: MarketComponent},
  {path: 'zkill-listener', component: ZkillListenerComponent},
  {path: 'profile-sync', component: ProfileSyncComponent},
];

@NgModule({imports: [RouterModule.forRoot(routes)], exports: [RouterModule]})
export class AppRoutingModule {
}
