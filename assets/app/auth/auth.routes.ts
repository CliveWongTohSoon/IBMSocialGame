import {Routes} from "@angular/router";
import {SigninComponent} from "./signin.component";
import {LogoutComponent} from "./logout.component";

export const AUTH_ROUTES: Routes = [
    { path: '', redirectTo: 'signin', pathMatch: 'full'},
    { path: 'signin', component: SigninComponent},
    { path: 'logout', component: LogoutComponent}
];