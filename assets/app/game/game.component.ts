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

    text: string = 'Right';
    disabledBool = true;

    battleField: BattleFieldModel;
    allBattleShip: ShipModel[];

    battleFieldP1: BattleFieldModel;
    battleFieldP2: BattleFieldModel;
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

    start(numberOfPlayers: string) {
       // randomDir();
        console.log(numberOfPlayers);

        this.allBattleShip = this.gameService.createShip(Number(numberOfPlayers));
        this.battleField = this.allBattleShip.reduce((prev, curr) => {
            prev = this.gameService.updateGrid(curr, this.battleField, curr.colorFront, curr.colorBack)
            return prev;
        }, this.battleField);

        console.log('Start the game');
    }

    rotate() {
        console.log('Rotating...');
    }

    move(ship: ShipModel) {
        // this.renderMe = false;
        console.log(ship);
        this.gameService.move();
    }
}