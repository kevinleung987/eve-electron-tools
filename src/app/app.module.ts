import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {NgxElectronModule} from 'ngx-electron';
import {PapaParseModule} from 'ngx-papaparse';

import {AppRoutingModule, CustomReuseStrategy} from './app-routing.module';
import {AppComponent} from './app.component';
import {LocalScanComponent} from './tools/local-scan/local-scan.component';
import {HeaderComponent} from './header/header.component';
import {LocalScanService} from './services/local-scan.service';
import {MarketService} from './services/market.service';
import {MarketComponent} from './tools/market/market.component';
import {HomeComponent} from './home/home.component';
import {
  ZkillListenerComponent
} from './tools/zkill-listener/zkill-listener.component';
import {RouteReuseStrategy} from '@angular/router';
import {EveService} from './services/eve.service';
import {EvePipe} from './common/eve.pipe';
import {
  ProfileSyncComponent
} from './tools/profile-sync/profile-sync.component';

@NgModule({
  declarations: [
    AppComponent,
    LocalScanComponent,
    HeaderComponent,
    MarketComponent,
    HomeComponent,
    ZkillListenerComponent,
    EvePipe,
    ProfileSyncComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    PapaParseModule,
    NgxElectronModule
  ],
  providers: [
    EveService,
    LocalScanService,
    MarketService,
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
