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

    renderMe = true;

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => this.battleField = battleField);
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
        // console.log(this.allBattleShip[0].shipPosition, this.allBattleShip[0].shipDirection.dir);
        this.battleField = this.gameService.updateGridWithShip(this.allBattleShip, this.battleField);

        console.log('Start the game');
    }

    rotateRight(ship: ShipModel) {
        console.log('Rotating...');
        const updatedShip = this.gameService.rotate(ship, true);
        this.battleField = this.gameService.updateGrid(updatedShip, this.battleField);
    }

    move(ship: ShipModel) {
        // TODO:- Issue: just update 1 ship
        this.gameService.move(ship, this.battleField.rowGrid.length);
        // this.battleField = this.gameService.updateGrid(updatedShip, this.battleField);
    }
}