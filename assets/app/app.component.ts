import {Component, OnInit} from '@angular/core';
// import * as io from 'socket.io-client';
import {MessageService} from "./messages/message.service";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService]
})
export class AppComponent {
    // private socket: SocketIOClient.Socket;

    constructor() {
        // this.socket = io();
        // this.socket.on('hello', data => console.log(data));
    }
}