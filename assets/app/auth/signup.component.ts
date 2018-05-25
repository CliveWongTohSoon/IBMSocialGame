import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "./auth.service";
import {UserModel} from "./user.model";

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html'
})

export class SignupComponent implements OnInit{
    myForm: FormGroup;

    constructor(private authService: AuthService) {}

    onSubmit() {

    // public userId: string,
    //         public email: string,
    //         public password: string,
    //         public firstName?: string,
    //         public lastName?: string
        const user = new UserModel(
            null,
            this.myForm.value.email,
            this.myForm.value.password,
            this.myForm.value.firstName,
            this.myForm.value.lastName
        );
        // console.log(this.myForm);
        this.authService.signup(user)
            .subscribe(
              data => console.log(data),
              error => console.log(error)
            );

        this.myForm.reset();
    }

    ngOnInit() {
        this.myForm = new FormGroup({
            firstName: new FormControl(null, Validators.required),
            lastName: new FormControl(null, Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.email
                ]),
            password: new FormControl(null, Validators.required)
        });
    }
}