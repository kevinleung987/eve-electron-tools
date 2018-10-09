import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LocalScanComponent } from './local-scan/local-scan.component';
import { MarketComponent } from './market/market.component';
import { HomeComponent } from './home/home.component';
import { ZkillWatcherComponent } from './zkill-watcher/zkill-watcher.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'local-scan', component: LocalScanComponent },
    { path: 'market', component: MarketComponent },
    { path: 'zkill-watcher', component: ZkillWatcherComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
