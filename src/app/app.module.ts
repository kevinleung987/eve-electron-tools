import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { PapaParseModule } from 'ngx-papaparse';

import { AppRoutingModule, CustomReuseStrategy } from './app-routing.module';
import { AppComponent } from './app.component';
import { EvePipe } from './common/eve.pipe';
import { ImagePipe } from './common/image.pipe';
import { LocalScanComponent } from './tools/local-scan/local-scan.component';
import { MarketComponent } from './tools/market/market.component';
import { ProfileSyncComponent } from './tools/profile-sync/profile-sync.component';
import { ZkillListenerComponent } from './tools/zkill-listener/zkill-listener.component';
import { HeaderComponent } from './ui/header/header.component';
import { HomeComponent } from './ui/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LocalScanComponent,
    HeaderComponent,
    MarketComponent,
    HomeComponent,
    ZkillListenerComponent,
    EvePipe,
    ImagePipe,
    ProfileSyncComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    PapaParseModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
