import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from "./app.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthComponent} from "./auth/auth.component";
import {HeaderComponent} from "./header.component";
import {routing} from "./app.routing";
import {SigninComponent} from "./auth/signin.component";
import {LogoutComponent} from "./auth/logout.component";
import {HttpClientModule} from "@angular/common/http";
import {GameComponent} from "./game/game.component";
import {IntroductionComponent} from "./introduction/introduction.component";
import {AuthService} from "./auth/auth.service";

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        HeaderComponent,
        SigninComponent,
        LogoutComponent,
        GameComponent,
        IntroductionComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        routing,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [
        AuthService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}