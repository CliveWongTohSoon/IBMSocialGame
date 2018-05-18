import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";

import {
    ShipDepartment,
    Action,
    ShipDirection,
    ShipModel,
    ShipPosition,
    ShipStats,
    CollisionInfo,
    ShipAction
} from "./ship-model";

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
        const maxX = this.battleField.rowGrid[0].length/(numberOfShips * 2);
        const maxY = this.battleField.rowGrid.length;

        this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX, 2*i*maxX), randomY = this.randomCoor(maxY,0);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir(4);
                const initShipDirection = new ShipDirection(randomDir);

                const  initShipStat = new ShipStats(1000,500,5,0,5,false,0);

                const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection,  initShipStat, randomColorFront, randomColorBack);

                newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                const newShipPosition = new ShipPosition(0,0);
                newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
                newShip.shipAction = new ShipAction(Array.apply(null, {length: 3})
                    .map(_ => Action.DoNothing)
                );
                // i++;

                return newShip;
            });

        this.updateGridWithAllShip();
        console.log(this.allBattleShips.length);
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
        var randomColor = "#" + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6);
        randomColor === '#FFFFF' ? '#990000' : '#' + randomColor;

        return randomColor;
    }

    shadeColor(color, percent) {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }


    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection) {
        ship.shipPosition = newPosition;
        ship.shipDirection = newDirection;
        ship.shipDepartment = ShipDepartment.updateDepartment(newPosition, newDirection, this.battleField.rowGrid.length,ship);
        this.updateGridWithAllShip();
        //console.log(ship.shipPosition);
    }

    worldRound(position: ShipPosition, fieldSize: number): ShipPosition {

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

    move(ship: ShipModel, fieldSize: number) {
        let newPosition: ShipPosition = new ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);

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

        newPosition = this.worldRound(newPosition, fieldSize);
        this.updateShip(ship, newPosition, ship.shipDirection);
        this.checkCollision(fieldSize);
        this.performCollision(fieldSize);

    }

    performCollision(fieldSize: number) {
        var validCheck = false;
        var i = 0;

        for (i = 0; i < this.allBattleShips.length; i++) {
            if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                validCheck = true;
            }
        }
        console.log(this.allBattleShips[0].collisionInfo.resultantMove);
        console.log(this.allBattleShips[1].collisionInfo.resultantMove);

        while (validCheck == true) {
            for (i = 0; i < this.allBattleShips.length; i++) {
                if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                    console.log("move count perform =" + this.allBattleShips[i].collisionInfo.moveCount);

                    this.allBattleShips[i].shipPosition.xIndex += this.allBattleShips[i].collisionInfo.resultantMove.xIndex;
                    this.allBattleShips[i].shipPosition.yIndex += this.allBattleShips[i].collisionInfo.resultantMove.yIndex;
                    this.allBattleShips[i].shipPosition = this.worldRound(this.allBattleShips[i].shipPosition, fieldSize);
                    this.allBattleShips[i].collisionInfo.moveCount--;
                    this.updateShip(this.allBattleShips[i], this.allBattleShips[i].shipPosition, this.allBattleShips[i].shipDirection);
                    console.log(i);
                    console.log(this.allBattleShips[i].shipPosition);

                }
            }

            this.checkCollision(fieldSize);
            validCheck = false;
            for (i = 0; i<this.allBattleShips.length; i++){
                console.log("inside check condition " +this.allBattleShips[i].collisionInfo.moveCount);
                if(this.allBattleShips[i].collisionInfo.moveCount > 0){
                    validCheck = true;
                }
            }

        }

        for (i = 0; i < this.allBattleShips.length; i++) {
            this.allBattleShips[i].collisionInfo.resultantMove.xIndex = 0;
            this.allBattleShips[i].collisionInfo.resultantMove.yIndex = 0;
        }
    }


    checkCollision(fieldSize :number){

        var i = 0, j = 0 ;
        var overflow : ShipPosition = new ShipPosition(0,0);

        for (i = 0; i < this.allBattleShips.length; i++) {
            for (var j = 0; j < this.allBattleShips.length; j++) {
                if ((((Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) == fieldSize-1)) && ((Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) == fieldSize-1)))&& this.allBattleShips[i].shipId !== this.allBattleShips[j].shipId) {

                    overflow.xIndex = this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex;
                    if(Math.abs(overflow.xIndex) == fieldSize - 1){
                        overflow.xIndex = -1 * Math.abs(overflow.xIndex)/overflow.xIndex;
                    }
                    overflow.yIndex = this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex;
                    if(Math.abs(overflow.yIndex) == fieldSize - 1){
                        overflow.yIndex = -1 * Math.abs(overflow.yIndex)/overflow.yIndex;
                    }

                    this.allBattleShips[i].collisionInfo.resultantMove.xIndex += overflow.xIndex;
                    this.allBattleShips[i].collisionInfo.resultantMove.yIndex += overflow.yIndex;

                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.xIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.xIndex = Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.xIndex)/this.allBattleShips[i].collisionInfo.resultantMove.xIndex;
                    }
                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.yIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.yIndex = Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.yIndex)/this.allBattleShips[i].collisionInfo.resultantMove.yIndex;
                    }

                    this.allBattleShips[i].collisionInfo.moveCount = Math.floor(Math.random() * 3 + 3);
                    console.log("Assigned move in check " + this.allBattleShips[i].collisionInfo.moveCount );
                }
            }
          //  console.log("Assigned move in check " + this.allBattleShips[i].collisionInfo.moveCount );
        }
    }


    rotate(ship: ShipModel, clockwise: boolean) {
        let newDirection: ShipDirection = new ShipDirection(ship.shipDirection.dir);
        if (clockwise) {
            if (newDirection.dir == 0) {
                newDirection.dir = 3;
            }
            else {
                newDirection.dir = ship.shipDirection.dir - 1;
            }
        }
        else {
            if (newDirection.dir == 3) {
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition, newDirection);
    }

    shield(ship: ShipModel, shieldDirection: Direction) {

        ship.shipStats.shieldActive = true;
        ship.shipStats.shieldDirection = shieldDirection;

        this.updateGridWithAllShip();

        console.log("shieldActive: " + ship.shipStats.shieldActive);
        console.log("shieldDirection " + ship.shipStats.shieldDirection);

    }


    // if(ship.ShipStats.shieldActive == 1 && ship.ShipStats.defence !=0) {

    //   NewShieldDirection = ship.ShipStats.shieldDirection + ship.shipDirection.dir;

    //   if (NewShieldDirection >=4){
    //       NewShieldDirection = NewShieldDirection%4;
    //   }



    randomDir(range : number): number {
        return Math.floor(Math.random() * range);
    }

    shoot(ship:ShipModel, fieldSize:number){
        for(let l =2;l<4;l++){
            loopAttackRange:
            for(let i = 1; i < ship.shipStats.attackRange+1; i++){ //check all attack range
                for(let j = 0; j < this.allBattleShips.length; j++){ // check all ships (for being attacked)
                    for (let k = 0; k < 4; k++) { //check all four department being hit, also 4 directions. directions are anti-clockwise, and four department are clockwise
                        let defendShip = this.allBattleShips[j];
                        let defendDepart = defendShip.shipDepartment.departmentArray[k];
                        let attackDepart = ship.shipDepartment.departmentArray[l];

                        let bothDepartExist:boolean = (defendDepart.health > 0) && (attackDepart.health > 0);
                        //let bothDepartExist:boolean = (defendDepart.alive) && (attackDepart.alive);
                        //once you implement the changing of alive, uncomment the line above and comment old bothDepartmentExist

                        let positionCorrectUp:boolean = ((attackDepart.yIndex - i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                        let positionCorrectDown:boolean = ((attackDepart.yIndex + i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                        let positionCorrectLeft:boolean = ((attackDepart.xIndex - i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);
                        let positionCorrectRight:boolean = ((attackDepart.xIndex + i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);

                        switch (ship.shipDirection.dir) { //check four attacking ship direction
                            case Direction.Up:
                                if ( positionCorrectUp && bothDepartExist ) {
                                    this.updateHealth(ship, defendShip, k, true);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Down:
                                if ( positionCorrectDown && bothDepartExist ) {
                                    this.updateHealth(ship, defendShip, k, true);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Left:
                                if ( positionCorrectLeft && bothDepartExist ) {
                                    this.updateHealth(ship, defendShip, k,true);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Right:
                                if ( positionCorrectRight && bothDepartExist ) {
                                    this.updateHealth(ship, defendShip, k, true);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                        }
                    }
                }
            }
        }

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

    } // end shoot



    randomCoor(max: number, start: number){ //}, prevPos : number, range : number){
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    }

    uidGenerator(): string {
        const S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    updateHealth(shooterShip: ShipModel, victimShip: ShipModel, affectedDep: number, shoot:boolean) {
        let damage: number;
        if(shoot ==true){
            damage = shooterShip.shipStats.attack;
        }

        if (victimShip.shipStats.shieldActive == true && shoot == true)  {
            damage = this.shootShieldCheck(shooterShip, victimShip, damage)
        }
        //else if (victimShip.shipStats.shieldActive == true && shoot = false){
            //damage = this.collisionShieldCheck(victimShip, shooterShip, damage )}

        if (victimShip.shipDepartment.departmentArray[affectedDep].health < damage) {
            victimShip.shipDepartment.departmentArray[affectedDep].health = 0;
        }
        else{
            victimShip.shipDepartment.departmentArray[affectedDep].health = victimShip.shipDepartment.departmentArray[affectedDep].health - damage;
        }

    }

    // shieldCheck(shooterShip: ShipModel, victimShip: ShipModel, damage: number) {
    //     let shieldGridDirection: Direction;
    //     let enemyDirection: Direction = 4;
    //     let reducedDamage = damage;
    //     shieldGridDirection = victimShip.shipDirection.dir + victimShip.shipStats.shieldDirection;
    //     if (shieldGridDirection > 3) {
    //         shieldGridDirection = shieldGridDirection - 4;
    //     }
    //     let xDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.xIndex;
    //     let yDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.yIndex;
    //     if (Math.abs(xDiff) < 1) {
    //         if (yDiff > 0) {
    //             enemyDirection = Direction.Up;
    //         }
    //         else {
    //             enemyDirection = Direction.Down;
    //         }
    //     }
    //     else if (Math.abs(yDiff) < 1) {
    //         if (xDiff > 0) {
    //             enemyDirection = Direction.Left;
    //         }
    //         else {
    //             enemyDirection = Direction.Right;
    //         }
    //     }
    //
    //     if (shieldGridDirection == enemyDirection) {
    //         reducedDamage = damage * (1 - victimShip.shipStats.defence);
    //     }
    //     return reducedDamage;
    // }
    shootShieldCheck(shooterShip: ShipModel, victimShip: ShipModel, damage: number) {
        let shieldGridDirection: Direction;
        // let enemyDirection: Direction = 4;
        let reducedDamage = damage;
        shieldGridDirection = victimShip.shipDirection.dir + victimShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (Math.abs(shieldGridDirection - shooterShip.shipDirection.dir) == 2){
            reducedDamage = damage * (1 - victimShip.shipStats.defence)
        }
        // let xDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.xIndex;
        // let yDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.yIndex;
        // if (Math.abs(xDiff) < 1) {
        //     if (yDiff > 0) {
        //         enemyDirection = Direction.Up;
        //     }
        //     else {
        //         enemyDirection = Direction.Down;
        //     }
        // }
        // else if (Math.abs(yDiff) < 1) {
        //     if (xDiff > 0) {
        //         enemyDirection = Direction.Left;
        //     }
        //     else {
        //         enemyDirection = Direction.Right;
        //     }
        // }
        //
        // if (shieldGridDirection == enemyDirection) {
        //     reducedDamage = damage * (1 - victimShip.shipStats.defence);
        // }
        return reducedDamage;
    }
    collisionShieldCheck(updatingShip: ShipModel, referShip: ShipModel, damage: number, turn: number){
        let shieldGridDirection: Direction;
        let reducedDamage = damage;
        let xDiff = updatingShip.shipPosition.xIndex - referShip.shipPosition.xIndex;
        let yDiff = updatingShip.shipPosition.yIndex - referShip.shipPosition.yIndex;
        shieldGridDirection = updatingShip.shipDirection.dir + updatingShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (referShip.shipAction.act[turn-1] == Action.MoveFront){
            if (Math.abs(shieldGridDirection - referShip.shipDirection.dir) == 2){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence);
            }
        }
        else if (referShip.shipAction.act[turn-1] == Action.RightTurn || referShip.shipAction.act[turn-1] == Action.LeftTurn){
            if (xDiff > 0){
                if (shieldGridDirection == Direction.Left){
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (xDiff < 0){
                if (shieldGridDirection == Direction.Right){
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            if (yDiff > 0){
                if (shieldGridDirection == Direction.Up) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (yDiff < 0){
                if (shieldGridDirection == Direction.Down){
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
        }
        else if (updatingShip.shipAction.act[turn-1] == Action.MoveFront){
            if(updatingShip.shipDirection.dir == shieldGridDirection){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence);
            }
        }
        // else if (updatingShip.shipAction.act[turn-1] == Action.LeftTurn || updatingShip.shipAction.act[turn-1] == Action.RightTurn){
        //     if (xDiff > 0){
        //         if (shieldGridDirection == Direction.Left){
        //             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
        //         }
        //     }
        //     else if (xDiff < 0){
        //         if (shieldGridDirection == Direction.Right){
        //             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
        //         }
        //     }
        //     if (yDiff > 0){
        //         if (shieldGridDirection == Direction.Up) {
        //             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
        //         }
        //     }
        //     else if (yDiff < 0){
        //         if (shieldGridDirection == Direction.Down){
        //             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
        //         }
        //     }
        // }
        return reducedDamage;
    }

}