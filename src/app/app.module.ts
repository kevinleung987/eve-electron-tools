import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalScanComponent } from './local-scan/local-scan.component';
import { HeaderComponent } from './header/header.component';
import { LocalScanService } from './services/local-scan.service';

@NgModule({
  declarations: [
    AppComponent,
    LocalScanComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [LocalScanService],
  bootstrap: [AppComponent]
})
export class AppModule { }
