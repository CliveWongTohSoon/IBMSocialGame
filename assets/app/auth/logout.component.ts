import {Component} from "@angular/core";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-logout',
    template: `
        <div class="col-md-8 col-md-offset-2">
            <a href="http://twitter.com"><button class="btn btn-danger">Logout</button></a>
        </div>
    `
})

export class LogoutComponent {

    constructor(private authService: AuthService,
                private router: Router) {}
}