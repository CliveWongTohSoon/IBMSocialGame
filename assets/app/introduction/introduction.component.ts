import {Component, EventEmitter, Input, Output} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import * as io from 'socket.io-client';

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent {

    // credential;
    private socket: SocketIOClient.Socket;

    constructor(private http: HttpClient) {
        this.socket = io();

        this.socket.on('start', data => {
            console.log('Entered start: ', data);
        });

        http.get('http://localhost:3000/getuser').subscribe(result => {
            const data = result['obj'];
            const message = {
                credentials: data['credentials'],
                userId: data['profile']['handle']
            };

            this.analysePersonality(message).then(result => {
                // Convert to ship Stats
                this.convertToShipStats(result);

                // Route to Game Service
                console.log('Routing to game service');
            });
        });
    }

    analysePersonality(message) {
        const body = JSON.stringify(message);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post('http://localhost:3000/api/profile/twitter', body, {headers: headers})
            .take(1)
            .toPromise();
    }

    convertToShipStats(data) { // Returns ship stats
        console.log('Converting to ship stats: ', data);
    }
}