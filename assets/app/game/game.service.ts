import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipModel} from "./ship-model";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;

    init(): BattleFieldModel {
        const rowContent = Array
            .apply(null, Array(25))
            .map((_, index) => new TableContent(index, 'white', null));


        const columnContent = Array
            .apply(null, Array(25))
            .map((_, index) => new TableContent(index, 'white', null));

        this.battleField = new BattleFieldModel(rowContent, columnContent);
        return this.battleField;
    }

    createGame(): BattleFieldModel {

        const currentShip = new ShipModel(null, null, null);
        this.battleField.rowGrid[1].ship = currentShip;
        this.battleField.colGrid[5].ship = currentShip;

        return this.battleField;
    }

    move() {
        const currentRowPosition = this.battleField.rowGrid.map(r => r.ship !== null);
        const currentColPosition = this.battleField.colGrid.map(c => c.ship !== null);
        console.log(currentColPosition, currentColPosition);
    }
}