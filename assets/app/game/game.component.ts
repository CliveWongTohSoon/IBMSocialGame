import {Component, OnInit} from "@angular/core";
import {ShipModel, Action, ShipAction, ShipPhase} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";
import {sharedStylesheetJitUrl} from "@angular/compiler";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent implements OnInit {

    text: string = 'Right';
    disabledBool = true;

    battleField: BattleFieldModel;
    allBattleShip: ShipModel[];

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => this.battleField = battleField);
    }

    renderBackgroundColor(col: TableContent) {
        return col.color ? col.color : 'white';
    }

    start(numberOfPlayers: string) {
        // randomDir();
       //  console.log(numberOfPlayers);
       //
       //  console.log("Working");
       //
       //  if (Number(numberOfPlayers) <= 2) {
       //      this.gameService.init(25)
       //          .subscribe(battleField => {
       //              this.battleField = battleField;
       //              this.gameService.createShip(Number(numberOfPlayers))
       //                  .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
       //          });
       //  }
       //
       //  else if (Number(numberOfPlayers) == 3) {
       //      this.gameService.init(30)
       //          .subscribe(battleField => {
       //              this.battleField = battleField;
       //              this.gameService.createShip(Number(numberOfPlayers))
       //                  .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
       //          });
       //  }
       //
       // else if (Number(numberOfPlayers) >= 4) {
       //      this.gameService.init(36)
       //          .subscribe(battleField => {
       //              this.battleField = battleField;
       //              this.gameService.createShip(Number(numberOfPlayers))
       //                  .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
       //          });
       //  }
       //
       //  this.fullTurns();
    }

    relativePosition(ship:ShipModel){
        this.gameService.relativePosition(ship,this.battleField.rowGrid.length);
    }

    inputMove(ship:ShipModel){
        this.gameService.inputMove(ship);
    }

    inputRotateLeft(ship:ShipModel){
        this.gameService.inputRotateLeft(ship);
    }

    inputRotateRight(ship:ShipModel){
        this.gameService.inputRotateRight(ship);
    }

    inputShoot(ship:ShipModel){
        this.gameService.inputShoot(ship);
    }

    inputShieldUp(ship:ShipModel){
        this.gameService.inputShieldUp(ship);
    }

    inputShieldDown(ship:ShipModel){
        this.gameService.inputShieldDown(ship);
    }

    inputShieldLeft(ship:ShipModel){
        this.gameService.inputShieldLeft(ship);
    }

    inputShieldRight(ship:ShipModel){
        this.gameService.inputShieldRight(ship);
    }

    fullTurns(){
        this.gameService.fullTurns();
    }

    instructionToAction(ship: ShipModel, instruction: String) {
        if (instruction === 'MoveFront') this.gameService.inputMove(ship);
        else if (instruction === 'LeftTurn') this.gameService.inputRotateLeft(ship);
        else if (instruction === 'RightTurn') this.gameService.inputRotateRight(ship);
        else if (instruction === 'ShootFront') this.gameService.inputShoot(ship);
        else if (instruction === 'FrontShield') this.gameService.inputShieldUp(ship);
        else if (instruction === 'BackShield') this.gameService.inputShieldDown(ship);
        else if (instruction === 'RightShield') this.gameService.inputShieldRight(ship);
        else if (instruction === 'LeftShield') this.gameService.inputShieldLeft(ship);
    }

    ngOnInit() {
        // this.gameService.createShipFromSocket().subscribe(console.log);
        this.gameService.listenToInstruction().subscribe(instructionData => {
            // Match instruction data to different action
            const currentShip = this.allBattleShip.filter(ship => ship.shipId === instructionData['shipId'])[0];

            // Update the ship phase to phase given in instruction
            currentShip.phase = this.gameService.getPhase(instructionData['phase']);
            const instruction0 = instructionData['instruction0'];
            const instruction1 = instructionData['instruction1'];
            const instruction2 = instructionData['instruction2'];

            // Update by calling fullTurns
            this.instructionToAction(currentShip, instruction0);
            this.instructionToAction(currentShip, instruction1);
            this.instructionToAction(currentShip, instruction2);

            // Check All BattleShip is Ready
            const allBattleShipReady = this.allBattleShip.reduce((prev, curr) => {
                const isAction = curr.phase === ShipPhase.Action && prev;
                return isAction;
            }, this.allBattleShip);

            if (allBattleShipReady) this.gameService.fullTurns();
        });

        this.gameService.createShipFromSocket().subscribe(shipModel => {
            const numberOfPlayers = shipModel.length;
            // if (numberOfPlayers <= 2) {
            //     this.gameService.init(25)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            // } else if (numberOfPlayers === 3) {
            //     this.gameService.init(30)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            //         });
            // } else if (numberOfPlayers >= 4) {
            //     this.gameService.init(36)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            //         });
            // }

            this.allBattleShip = shipModel;
        });
    }
}





