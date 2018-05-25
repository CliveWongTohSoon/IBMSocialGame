import {Component} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserModel} from "./user.model";
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html'
})

export class SigninComponent {
    myForm: FormGroup;

    constructor(private authService: AuthService,
                private router: Router) {}

    onSubmit() {
        const user = new UserModel(
            null,
            this.myForm.value.email,
            this.myForm.value.password
        );
        this.authService.signin(user)
            .subscribe(
                data => {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    this.router.navigateByUrl('/');
                },
                error => console.log(error)
                );
        this.myForm.reset();
    }

    ngOnInit() {
        this.myForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password: new FormControl(null, Validators.required)
        });
    }
}