import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDirection, ShipModel, ShipPosition} from "./ship-model";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;

    init(length: number): BattleFieldModel {

        let rowContent: Array<TableContent[]> = [];

        for (let i = 0; i < length; i++) {
            let colContent: TableContent[] = [];
            for (let j = 0; j < length; j++) {
                const column = new TableContent(i, null);
                colContent.push(column);
            }
            rowContent.push(colContent);
        }

        // const columnContent = Array
        //     .apply(null, Array(length))
        //     .map((_, index) => new TableContent(index, null));
        //
        // let rowContent = Array
        //     .apply(null, Array(length))
        //     .map(_ => columnContent);

        // rowContent[5][5].color = 'red';
        this.battleField = new BattleFieldModel(rowContent);
        return this.battleField;
    }

    createGame(prevBattleField: BattleFieldModel): BattleFieldModel {
        const initShipPosition = new ShipPosition(5.5, 5.5);
        const initShipDirection = new ShipDirection(true, false, false, false);
        const currentShip = new ShipModel('Clive', initShipPosition, initShipDirection, null);
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, prevBattleField);
    }

    move() {
        // const currentRowPosition = this.battleField.rowGrid.map(r => r.ship !== null);
        // const currentColPosition = this.battleField.colGrid.map(c => c.ship !== null);
        // console.log(currentColPosition, currentColPosition);
    }
}