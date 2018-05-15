import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDepartment, ShipDirection, ShipModel, ShipPosition, ShipStats} from "./ship-model";
import {Direction} from "./ship-model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;
    allBattleShips: ShipModel[];

    // --------------------------------- CREATE OBSERVABLE ---------------------------------------------------------- //
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
    }

    createShip(numberOfShips: number): Observable<ShipModel[]> {
        const maxY = this.battleField.rowGrid.length;
        const maxX = this.battleField.rowGrid[0].length;

        this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX), randomY = this.randomCoor(maxY);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir();
                const initShipDirection = new ShipDirection(randomDir);
                const initShipStats = new ShipStats (null,500,5,0);

                const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection, initShipStats, randomColorFront, randomColorBack);
                newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                return newShip;
            });

        this.updateGridWithAllShip();
        return Observable.of(this.allBattleShips);
    }

    updateGridWithAllShip() {
        this.battleField.rowGrid.map(col => col.map(c => c.color = null));

        this.battleField = this.allBattleShips.reduce((prev, curr) => {
            prev = this.updateGrid(curr);
            return prev;
        }, this.battleField);
    }

    updateGrid(currentShip: ShipModel): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, this.battleField, currentShip.colorFront, currentShip.colorBack);
    }

    genRandomColor(): string {
        return '#'+(Math.random()*0xFFFFFF<<0).toString(16) === '#FFFFFF' ? '#990000' : '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    shadeColor(color, percent) {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }


    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection) {
        let newShip : ShipModel = ship;
        newShip.shipPosition = newPosition;
        newShip.shipDirection = newDirection;
        newShip.shipDepartment = ShipDepartment.getDepartment(newPosition, newDirection, this.battleField.rowGrid.length);
        // this.updateGrid(newShip, this.battleField);
        // this.battleField = this.updateGrid(newShip);
        this.allBattleShips.filter(aShip => aShip.shipId === ship.shipId)[0] = ship;
        this.updateGridWithAllShip();
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

    move(ship: ShipModel, fieldSize:number) {
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
        this.updateShip(ship, newPosition, ship.shipDirection);
    }

    rotate(ship:ShipModel, clockwise: boolean){
        let newDirection:ShipDirection = new ShipDirection(ship.shipDirection.dir);
        if (clockwise){
            if (newDirection.dir == 0){
                newDirection.dir = 3;
            }
            else {
                newDirection.dir = ship.shipDirection.dir - 1;
            }
        }
        else{
            if(newDirection.dir == 3){
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition, newDirection);
    }








    shoot(ship:ShipModel){

        function findNeibourDepart( k:number,offset: number){ // kth department plus offset
            let result = k + offset;
            if( result > 3 || result < 0 ){
                return mod(result, 4);
            }else {
                return result;
            }

            function mod(n, m) {
                return ((n % m) + m) % m;
            }
        }

        loopAttackRange:
        for(let i = 1; i < ship.shipStats.attackRange+1; i++){ //check all attack range
            for(let j = 0; j < this.allBattleShips.length; j++){ // check all ships (for being attacked)
                for (let k = 0; k < 4; k++) { //check all four department being hit, also 4 directions. directions are anti-clockwise, and four department are clockwise
                    let horizontalRelativePosition = ship.shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex;
                    let verticalRelativePosition = ship.shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex;
                    let leftAttackDepart = ship.shipDepartment.departmentArray[2];
                    let rightAttackDepart = ship.shipDepartment.departmentArray[3];
                    let defendDepart = this.allBattleShips[j].shipDepartment.departmentArray[k];

                    switch(ship.shipDirection.dir){ //check four attacking ship direction

                        case Direction.Up:
                            switch(horizontalRelativePosition){

                                case 1: //only leftWeapon hits
                                    if (((leftAttackDepart.yIndex - i) == defendDepart.yIndex) && (leftAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        //write your update health function here, I already checked this particular department should be attacked
                                        //this.allBattleShips[j].shipDepartment.departmentArray[k] is damaged
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit up1');// notice I didn't add 1 for player's ship,so if j is 1 then actually player2's ship is being hit
                                        break loopAttackRange;
                                    }
                                    break;

                                case 0: // both weapon hits
                                    if (((leftAttackDepart.yIndex - i) == defendDepart.yIndex) && (leftAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {

                                        console.log('Department '+ k + ' of ship '+ j +' is being hit up0l');
                                        console.log('Department '+ findNeibourDepart(k,-1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    if (((rightAttackDepart.yIndex - i) == defendDepart.yIndex) && (rightAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit up0r');
                                        console.log('Department '+ findNeibourDepart(k,1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case -1: // only right weapon hits
                                    if (((rightAttackDepart.yIndex - i) == defendDepart.yIndex) && (rightAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        //this.allBattleShips[j].shipDepartment.departmentArray[k] is damaged
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit up-1');
                                        break loopAttackRange;
                                    }
                                    break;

                                default:
                            }
                            break; //end case Direction.Up

                        case Direction.Down:
                            switch(horizontalRelativePosition){
                                case 1: //only rightWeapon hits
                                    if (((rightAttackDepart.yIndex + i) == defendDepart.yIndex) && (rightAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        //this.allBattleShips[j].shipDepartment.departmentArray[k] is damaged
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit down 1');// notice I didn't add 1 for player's ship,so if j is 1 then actually player2's ship is being hit
                                        break loopAttackRange;
                                    }
                                    break;

                                case 0: // both weapon hits
                                    if (((leftAttackDepart.yIndex + i) == defendDepart.yIndex) && (leftAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit down0l');
                                        console.log('Department '+ findNeibourDepart(k,-1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    if (((rightAttackDepart.yIndex + i) == defendDepart.yIndex) && (rightAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit down0r haha');
                                        console.log('Department '+ findNeibourDepart(k,1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case -1:// only leftWeapon hits
                                    if (((leftAttackDepart.yIndex + i) == defendDepart.yIndex) && (leftAttackDepart.xIndex == defendDepart.xIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit down-1');
                                        break loopAttackRange;
                                    }
                                    break;

                                default:
                            }
                            break; //end case Direction.Down;

                        case Direction.Left:
                            switch(verticalRelativePosition){
                                case 1: //only rightWeapon hits
                                    if (((rightAttackDepart.xIndex - i) == defendDepart.xIndex) && (rightAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        //this.allBattleShips[j].shipDepartment.departmentArray[k] is damaged
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case 0: // both weapon hits
                                    if (((leftAttackDepart.xIndex - i) == defendDepart.xIndex) && (leftAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        console.log('Department '+ findNeibourDepart(k,-1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    if (((rightAttackDepart.xIndex - i) == defendDepart.xIndex) && (rightAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        console.log('Department '+ findNeibourDepart(k,1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case -1:// only leftWeapon hits
                                    if (((leftAttackDepart.xIndex - i) == defendDepart.xIndex) && (leftAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                default:
                            }
                            break; // end case Direction.Left;

                        case Direction.Right:
                            switch(verticalRelativePosition){
                                case 1: //only leftWeapon hits
                                    if (((leftAttackDepart.xIndex + i) == defendDepart.xIndex) && (leftAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        //this.allBattleShips[j].shipDepartment.departmentArray[k] is damaged
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case 0: // both weapon hits
                                    if (((leftAttackDepart.xIndex + i) == defendDepart.xIndex) && (leftAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        console.log('Department '+ findNeibourDepart(k,-1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    if (((rightAttackDepart.xIndex + i) == defendDepart.xIndex) && (rightAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        console.log('Department '+ findNeibourDepart(k,1) + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                case -1:// only rightWeapon hits
                                    if (((rightAttackDepart.xIndex + i) == defendDepart.xIndex) && (rightAttackDepart.yIndex == defendDepart.yIndex) && (defendDepart.health != 0)) {
                                        console.log('Department '+ k + ' of ship '+ j +' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;

                                default:
                            }
                            // end case Direction.Right;
                    } // end switch(ship.shipDirection.dir);
                } // end for (k);
            } // end for (j)
        } // end for(i)
    } // end shoot


    randomDir(): number{
        return Math.floor(Math.random() * 4);
    }


    randomCoor(max: number) { //adjustment: number, prevX: number):number {
        return Math.floor((Math.random() * max)) + 0.5; // (9 + adjustment)) + prevX + 8) + 0.5;
    }

    uidGenerator(): string {
        const S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
}