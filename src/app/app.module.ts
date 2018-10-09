import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule, CustomReuseStrategy } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalScanComponent } from './local-scan/local-scan.component';
import { HeaderComponent } from './header/header.component';
import { LocalScanService } from './services/local-scan.service';
import { MarketService } from './services/market.service';
import { MarketComponent } from './market/market.component';
import { HomeComponent } from './home/home.component';
import { ZkillWatcherComponent } from './zkill-watcher/zkill-watcher.component';
import { RouteReuseStrategy } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    LocalScanComponent,
    HeaderComponent,
    MarketComponent,
    HomeComponent,
    ZkillWatcherComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [LocalScanService, MarketService, { provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
