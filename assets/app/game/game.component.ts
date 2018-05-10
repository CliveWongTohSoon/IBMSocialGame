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

    constructor(private gameService: GameService) {
        gameService.init(25)
            .subscribe(battleField => this.battleField = battleField);
    }

    renderBackgroundColor(col: TableContent) {
        if (col.color) {
            return col.color;
        }
        return 'white';
    }

    start(numberOfPlayers: string) {
        this.gameService.createShip(Number(numberOfPlayers))
            .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
    }

    rotate(ship: ShipModel) {
        console.log('Rotating...');
        this.gameService.rotate(ship, true);
    }

    move(ship: ShipModel) {
        this.gameService.move(ship, this.battleField.rowGrid.length);
    }
}