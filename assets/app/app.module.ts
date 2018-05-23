import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from "./app.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessageComponent} from "./messages/message.component";
import {MessageListComponent} from "./messages/message-list.component";
import {MessageInputComponent} from "./messages/message-input.component";
import {MessagesComponent} from "./messages/messages.component";
import {AuthComponent} from "./auth/auth.component";
import {HeaderComponent} from "./header.component";
import {routing} from "./app.routing";
import {SignupComponent} from "./auth/signup.component";
import {SigninComponent} from "./auth/signin.component";
import {LogoutComponent} from "./auth/logout.component";
import {HttpClientModule} from "@angular/common/http";
import {GameComponent} from "./game/game.component";
import {AuthService} from "./auth/auth.service";

@NgModule({
    declarations: [
        AppComponent,
        MessageComponent,
        MessageListComponent,
        MessageInputComponent,
        MessagesComponent,
        AuthComponent,
        HeaderComponent,
        SignupComponent,
        SigninComponent,
        LogoutComponent,
        GameComponent
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