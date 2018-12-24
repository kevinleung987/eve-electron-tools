import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { PapaParseModule } from 'ngx-papaparse';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule, CustomReuseStrategy } from './app-routing.module';
import { AppComponent } from './app.component';
import { EvePipe } from './common/eve.pipe';
import { ImagePipe } from './common/image.pipe';
import { MyErrorHandler } from './services/error.service';
import { DirectionalScanComponent } from './tools/directional-scan/directional-scan.component';
import { LocalScanComponent } from './tools/local-scan/local-scan.component';
import { MarketComponent } from './tools/market/market.component';
import { ProfileSyncComponent } from './tools/profile-sync/profile-sync.component';
import { VNICompanionComponent } from './tools/vni-companion/vni-companion.component';
import { ZkillListenerComponent } from './tools/zkill-listener/zkill-listener.component';
import { HeaderComponent } from './ui/header/header.component';
import { HomeComponent } from './ui/home/home.component';
import { NavbarComponent } from './ui/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeaderComponent,
    HomeComponent,
    LocalScanComponent,
    DirectionalScanComponent,
    MarketComponent,
    ZkillListenerComponent,
    VNICompanionComponent,
    EvePipe,
    ImagePipe,
    ProfileSyncComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    PapaParseModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 2500,
      preventDuplicates: true,
      onActivateTick: true
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: ErrorHandler, useClass: MyErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
