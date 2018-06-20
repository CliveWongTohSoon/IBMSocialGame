import {Component} from "@angular/core";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html'
})

export class SigninComponent {

    hrefEndPoint = window.location.origin + '/auth/twitter';

    constructor(private authService: AuthService) {}

    loginToTwitter() {
        this.authService.loginToTwitter().subscribe();
    }

    ngOnInit() {}
}