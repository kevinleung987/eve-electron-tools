import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/shared/home/home.component';
import { DirectionalScanComponent } from 'src/app/tools/directional-scan/directional-scan.component';
import { LocalScanComponent } from 'src/app/tools/local-scan/local-scan.component';
import { MarketComponent } from 'src/app/tools/market/market.component';
import { NavigationComponent } from 'src/app/tools/navigation/navigation.component';
import { ZkillListenerComponent } from 'src/app/tools/zkill-listener/zkill-listener.component';
import { extraRoutes } from 'src/environments/routes';

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
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'local-scan', component: LocalScanComponent },
  { path: 'd-scan', component: DirectionalScanComponent },
  { path: 'market', component: MarketComponent },
  { path: 'zkill-listener', component: ZkillListenerComponent },
  { path: 'navigation', component: NavigationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot([...routes, ...extraRoutes], { useHash: true })],
  providers: [], exports: [RouterModule]
})
export class AppRoutingModule {
}
