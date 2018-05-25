import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDepartment, ShipDirection, ShipModel, ShipPosition, ShipStats, CollisionInfo, ShipAction, Action} from "./ship-model";
import {Direction} from "./ship-model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import * as io from 'socket.io-client';
import {Instruction, InstructionModel} from "./instruction-model";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class GameService {
    private socket: SocketIOClient.Socket;

    constructor(private http: HttpClient) {
        this.socket = io();
    }

    // ----------------------------- Data for all components -------------------------------------------------------- //
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
        // Make battleField an Observable, so whenever the battleField model changes, it will update
        return Observable.of(this.battleField);
    }

    // createShipFromDatabase(): Observable<ShipModel[]> {
    //     // TODO:- Dynamically change the numberOfShips
    //     // TODO:- Store position and direction on database
    //     // TODO:- Randomise initial position and direction on pi
    //     return this.http.get('http://localhost:3000/start')
    //         .map((response: Response, i) => { // For each ship
    //             const data = response['obj'];
    //             console.log('Fired!');
    //             return Object.keys(data).map(key => {
    //                 const shipId = data[key]['shipId'], randomX = data[key]['x'], randomY = data[key]['y'], randomDir = data[key]['dir'];
    //
    //                 const start = data[key]['phase'] === 'start'; // Check what I can do with this
    //                 const randomColorBack = this.genRandomColor();
    //                 const randomColorFront = this.shadeColor(randomColorBack, 20);
    //                 const initShipPosition = new ShipPosition(randomX, randomY);
    //                 const initShipDirection = new ShipDirection(randomDir);
    //
    //                 // TODO:- Change initShipStat to dynamically change according to emotion
    //                 const initShipStat = new ShipStats(1000,500,5,0,5,false,0);
    //
    //                 const newShip = new ShipModel(shipId, initShipPosition, initShipDirection,  initShipStat, randomColorFront, randomColorBack);
    //                 newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
    //                 const newShipPosition = new ShipPosition(0,0);
    //                 newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
    //                 newShip.shipAction = new ShipAction(Array.apply(null, {length: 3})
    //                     .map(_ => Action.DoNothing)
    //                 );
    //                 return start ? newShip : null;
    //             });
    //         })
    //         .map(allShip => allShip.filter(ship => ship !== null))
    //         .map(allShip => {
    //             this.allBattleShips = allShip;
    //             this.updateGridWithAllShip();
    //             return allShip;
    //         });
    // }

    updateShipToDatabase() {
        console.log('Emitting...');
        // this.socket.emit('update', this.allBattleShips);
    }

    createShipFromSocket(): Observable<ShipModel[]> {
        // this.socket.on('start', data => console.log(data));
        let observable = new Observable<ShipModel[]>(observer => {
           this.socket.on('start', data => {
               console.log('Entered Start');
               const allShips: ShipModel[] = Object.keys(data).map(key => {
                   // console.log(key, data[key]);
                   const shipId = data[key]['shipId'], randomX = data[key]['x'], randomY = data[key]['y'],
                       randomDir = data[key]['dir'];

                   const start = data[key]['phase'] === 'start'; // Check what I can do with this
                   const randomColorBack = this.genRandomColor();
                   const randomColorFront = this.shadeColor(randomColorBack, 20);
                   const initShipPosition = new ShipPosition(randomX, randomY);
                   const initShipDirection = new ShipDirection(randomDir);

                   // TODO:- Change initShipStat to dynamically change according to emotion

                   // TODO:- Update the health points of department
                   const initShipStat = new ShipStats(1000, 500, 5, 0, 5, false, 0);

                   const newShip = new ShipModel(shipId, initShipPosition, initShipDirection, initShipStat, randomColorFront, randomColorBack);
                   newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                   const newShipPosition = new ShipPosition(0, 0);
                   newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
                   newShip.shipAction = new ShipAction(Array.apply(null, {length: 3})
                       .map(_ => Action.DoNothing)
                   );
                   return start ? newShip : null;
               })
                   .filter(ship => ship !== null);

               this.allBattleShips = allShips;
               this.updateGridWithAllShip();
               observer.next(allShips);
           });
           return () => {this.socket.disconnect()};
        });
        return observable;
    }

    // TODO:- OLD
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

                const initShipStat = new ShipStats(1000,500,5,0.5,5,false,0);
                const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection,  initShipStat, randomColorFront, randomColorBack);
                newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                const newShipPosition = new ShipPosition(0,0);
                newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
                newShip.shipAction = new ShipAction(Array.apply(null, {length: 0})
                    .map(_ => null));
                return newShip;
            });
        this.updateGridWithAllShip();
        return Observable.of(this.allBattleShips);
    }

    listenToInstruction(): Observable<InstructionModel> {
        return this.http.get('http://localhost:3000/instruction')
            .map((response: Response) => {
                const instruction = response['obj'];
                const instructionArray: Instruction[] = Array
                    .apply(null, {length: 3})
                    .map(arr => {
                       arr[0] = this.getInstruction(instruction['instruction0']);
                       arr[1] = this.getInstruction(instruction['instruction1']);
                       arr[2] = this.getInstruction(instruction['instruction2']);
                    });
                const shipId = response['shipId'];
                // Make sure the ship is in action phase
                const phase = instruction['phase'] === 'action';
                const instructionModel = new InstructionModel(shipId, instructionArray);
                return phase ? instructionModel : null;
            });
    }

    // ------------------------------------- Static functions ------------------------------------------------------- //
    getInstruction(instruction: string): Instruction {
        if (instruction === 'move') return Instruction.Move;
        else if (instruction === 'turnLeft') return Instruction.TurnLeft;
        else if (instruction === 'turnRight') return Instruction.TurnRight;
        else if (instruction === 'shoot') return Instruction.Shoot;
        else if (instruction === 'shieldLeft') return Instruction.ShieldLeft;
        else if (instruction === 'shieldRight') return Instruction.ShieldRight;
        else if (instruction === 'shieldBack') return Instruction.ShieldBack;
        else if (instruction === 'shieldFront') return Instruction.ShieldFront;
        else return Instruction.DoNothing
    }

    executeInstruction(ship: ShipModel, instruction: Instruction) {
        if (instruction === Instruction.Move) this.move(ship)
        else if (instruction === Instruction.ShieldFront) this.shield(ship, Direction.Up);
        else if (instruction === Instruction.ShieldBack) this.shield(ship, Direction.Down);
        else if (instruction === Instruction.ShieldRight) this.shield(ship, Direction.Right);
        else if (instruction === Instruction.ShieldLeft) this.shield(ship, Direction.Left);
        else if (instruction === Instruction.Shoot) this.shoot(ship);
        else if (instruction === Instruction.TurnRight) this.rotate(ship, true);
        else if (instruction === Instruction.TurnLeft) this.rotate(ship, false);
    }

    // --------------------------------------- Update Data ---------------------------------------------------------- //
    updateGridWithAllShip() {
        // Clear the map
        this.battleField.rowGrid.map(col => col.map(c => c.color = null));

        this.battleField = this.allBattleShips.reduce((prev, curr) => {
            prev = this.updateGrid(curr);
            return prev;
        }, this.battleField);
    }

    updateGrid(currentShip: ShipModel): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, this.battleField, currentShip.colorFront, currentShip.colorBack);
    }

    // TODO:-  Just need to update the final position to the cloud
    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection) {
        ship.shipPosition = newPosition;
        ship.shipDirection = newDirection;
        ship.shipDepartment = ShipDepartment.updateDepartment(newPosition, newDirection, this.battleField.rowGrid.length, ship);

        this.socket.emit('update', {shipId: ship.shipId, x: ship.shipPosition.xIndex, y: ship.shipPosition.yIndex, dir: ship.shipDirection.dir});

        this.updateGridWithAllShip();
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

    move(ship: ShipModel) {
        const fieldSize = this.battleField.rowGrid.length;
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
    }

    performCollision(fieldSize: number, turn: number) {
        var validCheck = false;
        var i = 0;

        for (i = 0; i < this.allBattleShips.length; i++) {
            if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                validCheck = true;
            }
        }
        while (validCheck == true) {
            for (i = 0; i < this.allBattleShips.length; i++) {
                if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                    this.allBattleShips[i].shipPosition.xIndex += this.allBattleShips[i].collisionInfo.resultantMove.xIndex;
                    this.allBattleShips[i].shipPosition.yIndex += this.allBattleShips[i].collisionInfo.resultantMove.yIndex;
                    this.allBattleShips[i].shipPosition = this.worldRound(this.allBattleShips[i].shipPosition, fieldSize);
                    this.allBattleShips[i].collisionInfo.moveCount--;
                    this.updateShip(this.allBattleShips[i], this.allBattleShips[i].shipPosition, this.allBattleShips[i].shipDirection);
                }
            }

            this.checkCollision(fieldSize, turn);
            validCheck = false;
            for (i = 0; i<this.allBattleShips.length; i++){
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

    checkCollision(fieldSize :number, turn:number){

        var i = 0, j = 0 ;
        var resultant : ShipPosition = new ShipPosition(0,0);

        for (i = 0; i < this.allBattleShips.length; i++) {
            for (var j = 0; j < this.allBattleShips.length; j++) {
                if ((((Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) == fieldSize-1)) && ((Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) == fieldSize-1)))&& this.allBattleShips[i].shipId !== this.allBattleShips[j].shipId) {
                    this.checkCollisionHit(this.allBattleShips[i], this.allBattleShips[j], turn);
                    if(this.allBattleShips[i].shipPosition.xIndex-this.allBattleShips[j].shipPosition.xIndex == 0 && this.allBattleShips[i].shipPosition.yIndex- this.allBattleShips[j].shipPosition.yIndex == 0){
                        this.assignResultant(this.allBattleShips[i]);
                    }
                    resultant.xIndex = this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex;
                    resultant.yIndex = this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex;

                    if(Math.abs(resultant.xIndex) == fieldSize - 1){
                        resultant.xIndex = -1 * this.adjustOverflow(resultant.xIndex);
                    }
                    if(Math.abs(resultant.yIndex) == fieldSize - 1){
                        resultant.yIndex = -1 * this.adjustOverflow(resultant.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.resultantMove.xIndex += resultant.xIndex;
                    this.allBattleShips[i].collisionInfo.resultantMove.yIndex += resultant.yIndex;

                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.xIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.xIndex = this.adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.xIndex);
                    }
                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.yIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.yIndex = this.adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.moveCount = Math.floor(Math.random() * 3 + 3);

                }
            }
        }
    }

    assignResultant(ship: ShipModel) {
        if(ship.collisionInfo.moveCount == 0) {
            if (ship.shipDirection.dir == Direction.Up) {
                ship.collisionInfo.resultantMove.yIndex = 1;

            } else if (ship.shipDirection.dir == Direction.Down) {
                ship.collisionInfo.resultantMove.yIndex = -1;

            } else if (ship.shipDirection.dir == Direction.Right) {
                ship.collisionInfo.resultantMove.xIndex = -1;

            } else if (ship.shipDirection.dir == Direction.Left) {
                ship.collisionInfo.resultantMove.xIndex = 1;
            }
        }
        else{
            console.log("ELSE");
            ship.collisionInfo.resultantMove.xIndex *= -1;
            ship.collisionInfo.resultantMove.yIndex *= -1;
        }
    }

    checkCollisionHit(rammerShip: ShipModel, victimShip: ShipModel, turn: number){
       for(let i = 0; i < 4; i++){
           for(let j = 0; j < 4; j++){
               if (rammerShip.shipDepartment.departmentArray[i].xIndex == victimShip.shipDepartment.departmentArray[j].xIndex && rammerShip.shipDepartment.departmentArray[i].yIndex == victimShip.shipDepartment.departmentArray[j].yIndex){
                   this.updateCollisionHealth(rammerShip, i, victimShip, j, turn);
               }
           }
       }
    }

    adjustOverflow(overflow : number):number{
        return Math.abs(overflow)/overflow;
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
        } else {
            if (newDirection.dir == 3) {
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition,newDirection);
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

    shoot(ship:ShipModel){
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
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Down:
                                if ( positionCorrectDown && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Left:
                                if ( positionCorrectLeft && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Right:
                                if ( positionCorrectRight && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                        }
                    }
                }
            }
        }

        // function findNeibourDepart( k:number,offset: number){ // kth department plus offset
        //     let result = k + offset;
        //     if( result > 3 || result < 0 ){
        //         return mod(result, 4);
        //     }else {
        //         return result;
        //     }
        //
        //     function mod(n, m) {
        //         return ((n % m) + m) % m;
        //     }
        // }

    } // end shoot

    relativePosition(ship:ShipModel,l:number){

        let dir = ship.shipDirection.dir;
        for( let i = 0; i < this.allBattleShips.length; i++ ){
            let x0 = ship.shipPosition.xIndex;
            let y0 = ship.shipPosition.yIndex;

            let x = this.allBattleShips[i].shipPosition.xIndex;
            let y = this.allBattleShips[i].shipPosition.yIndex;
            let xd = x - x0;
            let yd = y - y0;

            if(!( xd == 0 &&  yd == 0)){
                if( xd == 0 ){
                    if( yd < 0 ){ logPolar( i,0, -yd); }
                    else{ logPolar( i,180,yd ); }
                }else if( yd == 0 ){
                    if( xd < 0 ){ logPolar( i,270, xd );}
                    else{ logPolar( i,90, -xd ); }
                }else{
                    if(  yd < 0 ) {
                        { calPolar(i,wrapDistance(xd),wrapDistance(yd),wrapSub(yd)); }
                    }
                    else{
                        { calPolar(i,wrapDistance(xd),wrapDistance(yd),wrapSub(yd)); }
                    }

                }
            } else{
                console.log("current ship is " + i )
            }
        }
        console.log("\n")

        function wrapDistance(xd:number){
            if( Math.abs( xd ) < l/2 ){ return xd; }
            else{
                if( xd < 0 ){ return l + xd; }
                else{ return  -( l - xd ); }
            }
        }
        function wrapSub(yd:number){
            if( Math.abs( yd ) < l/2 ){
                if( yd < 0 ){ return  0; }
                else{ return  180; }
            } else{
                if( yd < 0 ){ return  180; }
                else{ return   0;}
            }
        }
        function calPolar(i:number,xd:number,yd:number,sub:number){
            let rad = Math.atan(xd/yd);
            let deg = rad*180/Math.PI;
            let d = distance( xd, yd );
            logPolar( i, adjustByDir(dir,sub - deg ), d);
        }
        function distance(a:number,b:number){
            return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
        }
        function logPolar(i:number,deg:number,distance:number){
            console.log("ship " + i +" 's relative position from this ship is: " + deg +" degree, distance is "+ distance );
        }
        function adjustByDir(dir:Direction,deg:number){
            return mod(dir*90 + deg,360 );
        }
        function mod(n, m) {
            return ((n % m) + m) % m;
        }

    }

    randomCoor(max: number, start: number){ //}, prevPos : number, range : number){
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    }

    genRandomColor(): string {
        return '#'+(Math.random()*0xFFFFFF<<0).toString(16) === '#FFFFFF' ? '#990000' : '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    shadeColor(color, percent): string {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    uidGenerator(): string {
        const S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    updateCollisionHealth(rammerShip: ShipModel, affectedRammerDep: number, victimShip: ShipModel, affectedVictimDep: number, turn :number) {
        let damage: number;
        damage = 300;
        if(rammerShip.shipDepartment.departmentArray[affectedRammerDep].alive == false){
            damage = 50/100 * damage;
        }

        if(victimShip.shipStats.shieldActive == true) {
            damage = this.collisionShieldCheck(victimShip, rammerShip, damage, turn);
        }

        console.log("DAMAGE" + damage);
        if (victimShip.shipDepartment.departmentArray[affectedVictimDep].health < damage) {
            victimShip.shipDepartment.departmentArray[affectedVictimDep].health = 0;
        }
        else{
            victimShip.shipDepartment.departmentArray[affectedVictimDep].health = victimShip.shipDepartment.departmentArray[affectedVictimDep].health - damage;
        }
    }

    updateShootHealth(shooterShip: ShipModel, victimShip: ShipModel, affectedDep: number) {
        let damage: number;

        damage = shooterShip.shipStats.attack;
        if (victimShip.shipStats.shieldActive == true) {
            damage = this.shootShieldCheck(shooterShip, victimShip, damage);
        }
        if (victimShip.shipDepartment.departmentArray[affectedDep].health < damage) {
            victimShip.shipDepartment.departmentArray[affectedDep].health = 0;
        } else{
            victimShip.shipDepartment.departmentArray[affectedDep].health = victimShip.shipDepartment.departmentArray[affectedDep].health - damage;
        }
    }


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
        // let xDiff = updatingShip.shipPosition.xIndex - referShip.shipPosition.xIndex;
        // let yDiff = updatingShip.shipPosition.yIndex - referShip.shipPosition.yIndex;
        shieldGridDirection = updatingShip.shipDirection.dir + updatingShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (updatingShip.collisionInfo.moveCount == 0 && referShip.collisionInfo.moveCount == 0) {
            if (referShip.shipAction.act[turn - 1] == Action.MoveFront) {
                if (Math.abs(shieldGridDirection - referShip.shipDirection.dir) == 2) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (updatingShip.shipAction.act[turn - 1] == Action.MoveFront) {
                if (updatingShip.shipDirection.dir == shieldGridDirection) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
        }
        else if (referShip.collisionInfo.moveCount != 0){
            if (referShip.collisionInfo.resultantMove.yIndex > 0 && shieldGridDirection == Direction.Up) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.yIndex < 0 && shieldGridDirection == Direction.Down){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex > 0 && shieldGridDirection == Direction.Left){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex < 0 && shieldGridDirection == Direction.Right){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        else if (updatingShip.collisionInfo.moveCount != 0){
            if (updatingShip.shipStats.shieldDirection == Direction.Up){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        return reducedDamage;
    }


}

// else if (referShip.shipAction.act[turn-1] == Action.RightTurn || referShip.shipAction.act[turn-1] == Action.LeftTurn){
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

