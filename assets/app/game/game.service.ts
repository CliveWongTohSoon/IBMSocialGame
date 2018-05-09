import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDirection, ShipModel, ShipPosition} from "./ship-model";
import {D} from "@angular/core/src/render3";

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

    randomDir():string{
       //let dir = ['true,false,false,false','false,true,false,false','false,false,true,false','false,false,false,true'];
        let dir = ['ynnn','nynn','nnyn','nnny'];
        let x = dir[(Math.floor(Math.random() * 4))];
        return x;
    }

    randomCoor(){ //adjustment: number, prevX: number):number{
        var x;
        x = Math.floor((Math.random() * 25)) + 0.5;//(9 + adjustment)) + prevX + 8) + 0.5;

        console.log(x);
        return (x);
    }

    createGame(prevBattleField: BattleFieldModel, x: number, y: number, colourFront: string, colourBack: string, dirLeft: string, dirRight: string, dirFront: string, dirBack: string): BattleFieldModel {

        const initShipPosition = new ShipPosition(x, y);
        const initShipDirection = new ShipDirection(dirLeft, dirRight, dirFront, dirBack);
        const currentShip = new ShipModel('Clive', initShipPosition, initShipDirection, null);
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, prevBattleField, colourFront, colourBack);
    }

    move(positionX:number,positionY:number, direction, fieldSizeX:number, fieldSizeY:number){
        if (direction = Direction.Up) {
            newY = positionY - 1;
            newX = positionX;
        }
        else if (direction = Direction.Down) {
            newY = positionY + 1;
            newX = positionX;
        }
        else if (direction = Direction.Right) {
            newX = positionX + 1;
            newY = positionY;
        }
        else if (direction = Direction.Left) {
            newX = positionX - 1;
            newY = positionY;
        }
    }
         //const currentRowPosition = this.battleField.rowGrid.map(r => r.ship !== null);
        // const currentColPosition = this.battleField.colGrid.map(c => c.ship !== null);
        // console.log(currentColPosition, currentColPosition);
    }
}