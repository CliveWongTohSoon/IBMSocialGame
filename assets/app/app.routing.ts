import {RouterModule, Routes} from "@angular/router";
import {MessagesComponent} from "./messages/messages.component";
import {AuthComponent} from "./auth/auth.component";
import {AUTH_ROUTES} from "./auth/auth.routes";
import {GameComponent} from "./game/game.component";

const APP_ROUTES: Routes = [
    { path: 'game', component: GameComponent},
    { path: 'messages', component: MessagesComponent },
    { path: 'auth', component: AuthComponent, children: AUTH_ROUTES },
    { path: '', redirectTo: '/messages', pathMatch: 'full' }
];

export const routing = RouterModule.forRoot(APP_ROUTES);