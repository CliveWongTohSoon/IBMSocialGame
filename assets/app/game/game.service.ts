import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDepartment, ShipDirection, ShipModel, ShipPosition} from "./ship-model";
import {Direction} from "./ship-model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;
    allBattleShips: ShipModel[];

    init(length: number): Observable<BattleFieldModel> {
        let rowContent: Array<TableContent[]> = [];
        for (let i = 0; i < length; i++) {
            let colContent: TableContent[] = [];
            for (let j = 0; j < length; j++) {
                const column = new TableContent(i, null);
                colContent.push(column);
            }
            rowContent.push(colContent);
        }

        this.battleField = new BattleFieldModel(rowContent);

        return Observable.of(this.battleField);
        // return this.battleField;
    }


    updateGridWithShip(allBattleShip: ShipModel[], prevBattleField: BattleFieldModel): BattleFieldModel {
        return allBattleShip.reduce((prev, curr) => {
            prev = this.updateGrid(curr, prevBattleField);
            return prev;
        }, prevBattleField);
    }

    updateGrid(currentShip: ShipModel, prevBattleField: BattleFieldModel): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, prevBattleField, currentShip.colorFront, currentShip.colorBack);
    }

    createShip(numberOfShips: number): ShipModel[] {
        //
        const maxY = this.battleField.rowGrid.length;
        const maxX = this.battleField.rowGrid[0].length;

        return this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX), randomY = this.randomCoor(maxY);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir();
                const initShipDirection = new ShipDirection(randomDir);
                return new ShipModel('Clive', initShipPosition, initShipDirection, null, randomColorFront, randomColorBack);
            });
    }

    genRandomColor(): string {
        return '#'+(Math.random() * 0xFFFFFF<<0).toString(16) === '#FFFFFF' ? '#990000' : '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    shadeColor(color, percent) {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection): ShipModel {
        let newShip : ShipModel = ship;
        newShip.shipPosition = newPosition;
        newShip.shipDirection = newDirection;
        newShip.shipDepartment = ShipDepartment.getDepartment(newPosition, newDirection);
        return newShip;
    }

    obsUpdateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection): BattleFieldModel {
        let newShip : ShipModel = ship;
        newShip.shipPosition = newPosition;
        newShip.shipDirection = newDirection;
        newShip.shipDepartment = ShipDepartment.getDepartment(newPosition, newDirection);
        this.battleField = this.updateGrid(newShip, this.battleField);
        return this.battleField;
        // return newShip;
    }

    worldRound(position:ShipPosition, fieldSize: number): ShipPosition {
        let newPosition: ShipPosition = position;

        if (position.xIndex >= fieldSize) {
            newPosition.xIndex = position.xIndex - fieldSize;
        } else if (position.xIndex < 0) {
            newPosition.xIndex = position.xIndex + fieldSize;
        }

        if (position.yIndex >= fieldSize) {
            newPosition.yIndex = position.yIndex - fieldSize;
        } else if (position.yIndex < 0) {
            newPosition.yIndex = position.yIndex + fieldSize;
        }

        return newPosition;
    }

    move(ship: ShipModel, fieldSize:number): BattleFieldModel {
        let newPosition: ShipPosition = new ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);
        // console.log('Previous position:', newPosition);
        if (ship.shipDirection.dir == Direction.Up) {
            console.log('Enter up');
            newPosition.yIndex = newPosition.yIndex - 1;
        } else if (ship.shipDirection.dir == Direction.Down) {
            console.log('Enter down');
            newPosition.yIndex = newPosition.yIndex + 1;
        } else if (ship.shipDirection.dir == Direction.Right) {
            console.log('Enter right');
            newPosition.xIndex = newPosition.xIndex + 1;
        } else if (ship.shipDirection.dir == Direction.Left) {
            console.log('Enter left');
            newPosition.xIndex = newPosition.xIndex - 1;
        }
        // console.log('New position: ', newPosition);
        newPosition = this.worldRound(newPosition, fieldSize);
        console.log('Updated ship department:', ship.shipDepartment);
        return this.obsUpdateShip(ship, newPosition, ship.shipDirection);
    }

    rotate(ship:ShipModel, clockwise: boolean){
        let newDirection:ShipDirection = ship.shipDirection;
        if (clockwise){
            newDirection.dir = ship.shipDirection.dir - 1;
        }
        else{
            newDirection.dir = ship.shipDirection.dir +1;
        }
        return this.updateShip(ship, ship.shipPosition, newDirection);
    }

    randomDir(): number{

        var x= Math.floor(Math.random() * 4);
        console.log(x);
        return x;

    }


    randomCoor(max: number) { //adjustment: number, prevX: number):number {
        return Math.floor((Math.random() * max)) + 0.5; // (9 + adjustment)) + prevX + 8) + 0.5;
    }

}