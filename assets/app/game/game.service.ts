import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDirection, ShipModel, ShipPosition} from "./ship-model";
import {Direction} from "./ship-model";

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

    randomDir():number{
       //let dir = ['true,false,false,false','false,true,false,false','false,false,true,false','false,false,false,true'];
       //  let dir = ['ynnn','nynn','nnyn','nnny'];
       //  let x = dir[(Math.floor(Math.random() * 4))];
       //  return x;
        return Math.floor(Math.random() * 3)
    }

    randomCoor(){ //adjustment: number, prevX: number):number{
        var x;
        x = Math.floor((Math.random() * 24)) + 0.5;//(9 + adjustment)) + prevX + 8) + 0.5;

        if(x > 23.5)
            x = x - 23.5;
        console.log(x);
        return (x);
    }

    createGame(prevBattleField: BattleFieldModel, x: number, y: number, colourFront: string, colourBack: string, dir:Direction): BattleFieldModel {

        const initShipPosition = new ShipPosition(x, y);
        const initShipDirection = new ShipDirection(dir);
        const currentShip = new ShipModel('Clive', initShipPosition, initShipDirection, null);
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, prevBattleField, colourFront, colourBack);
    }

    move() {
         //const currentRowPosition = this.battleField.rowGrid.map(r => r.ship !== null);
        // const currentColPosition = this.battleField.colGrid.map(c => c.ship !== null);
        // console.log(currentColPosition, currentColPosition);
    }
}