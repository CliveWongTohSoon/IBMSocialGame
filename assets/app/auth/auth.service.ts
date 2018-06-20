import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import "rxjs/add/operator/map";


@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {

    }

    loginToTwitter() {
        return this.http.get('http://localhost:3000/auth/twitter');
    }
}