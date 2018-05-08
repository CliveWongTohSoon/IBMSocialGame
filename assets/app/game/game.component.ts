import {Component} from "@angular/core";
import {ShipModel} from "./ship-model";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})

export class GameComponent {
    // TODO:- Change this to contain information
    rowGrid = new Array(25);
    colGrid = new Array(25);
}