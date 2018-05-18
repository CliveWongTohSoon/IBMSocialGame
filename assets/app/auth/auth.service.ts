import {UserModel} from "./user.model";
import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {

    }

    signup(user: UserModel) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post('http://localhost:3000/user', body, {headers: headers})
            .map((response: Response) => response)
            .catch((error: Response) => Observable.throw(error));
    }

    signin(user: UserModel) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post('http://localhost:3000/user/signin', body, {headers: headers})
            .map((response: Response) => response)
            .catch((error: Response) => Observable.throw(error));
    }

    logout() {
        localStorage.clear();
    }

    isLoggedIn() {
        return localStorage.getItem('token') !== null;
    }
}