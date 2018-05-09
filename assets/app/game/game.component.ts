import {Component} from "@angular/core";
import {ShipModel} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";
import {HalloModel} from "./hallo-model";


@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent {

    text: string = 'Ola';
    disabledBool = true;

    battleField: BattleFieldModel;
    renderMe = true;

    helloModel: HalloModel;

    constructor(private gameService: GameService) {
        this.helloModel = new HalloModel('Hello');
        this.battleField = gameService.init();
    }

    renderBackgroundColor(row: TableContent, col: TableContent) {
        if (row.ship && col.ship) {
            // console.log(row.ship, col.ship);
            return 'red';
        }
        return 'white';
    }

    main() {
        this.battleField = this.gameService.createGame();
        console.log('Start the game');
    }

    move() {
        this.renderMe = false;
        // this.gameService.move();
    }
}