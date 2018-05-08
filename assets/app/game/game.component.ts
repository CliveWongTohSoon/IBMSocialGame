import {Component} from "@angular/core";
import {ShipModel} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent {

    battleField: BattleFieldModel;

    constructor(private gameService: GameService) {
        this.battleField = gameService.init();
    }

    renderBackgroundColor(row: TableContent, col: TableContent) {

    }

    main() {
        this.battleField = this.gameService.createGame();
        console.log('Start the game');
    }

    move() {

    }
}