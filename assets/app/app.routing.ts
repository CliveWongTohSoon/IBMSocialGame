import {RouterModule, Routes} from "@angular/router";
import {MessagesComponent} from "./messages/messages.component";
import {AuthComponent} from "./auth/auth.component";
import {AUTH_ROUTES} from "./auth/auth.routes";
import {GameComponent} from "./game/game.component";
import {IntroductionComponent} from "./introduction/introduction.component";

const APP_ROUTES: Routes = [
    { path: 'game', component: GameComponent},
    { path: 'messages', component: MessagesComponent },
    { path: 'auth', component: AuthComponent, children: AUTH_ROUTES },
    { path: 'introduction', component: IntroductionComponent},
    { path: '', redirectTo: '/auth/signin', pathMatch: 'full' }
];

export const routing = RouterModule.forRoot(APP_ROUTES);