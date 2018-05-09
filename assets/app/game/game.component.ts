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

    text: string = 'Ola';
    disabledBool = true;

    battleField: BattleFieldModel;
    renderMe = true;

    constructor(private gameService: GameService) {
        this.battleField = gameService.init(25);
    }

    renderBackgroundColor(col: TableContent) {
        if (col.color) {
            return col.color;
        }
        return 'white';
    }

    main() {
        this.battleField = this.gameService.createGame(this.battleField);

        console.log('Start the game');
    }

    move() {
        // this.renderMe = false;
        this.gameService.move();
    }
}