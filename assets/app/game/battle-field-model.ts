import { ShipDepartment } from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: Array<TableContent[]>) {} // row grid contain the column array

    static renderGrid(shipDepartment: ShipDepartment, battleField: BattleFieldModel, colourFront: string, colourBack: string) {

        const leftWeaponRowIndex = shipDepartment[2].yIndex, leftWeaponColIndex = shipDepartment[2].xIndex;

        const rightWeaponRowIndex = shipDepartment[3].yIndex, rightWeaponColIndex = shipDepartment[3].xIndex;

        const leftEngineRowIndex = shipDepartment[1].yIndex, leftEngineColIndex = shipDepartment[1].xIndex;

        const rightEngineRowIndex = shipDepartment[0].yIndex, rightEngineColIndex = shipDepartment[0].xIndex;


        battleField.rowGrid[leftWeaponRowIndex][leftWeaponColIndex].color = colourFront;
        battleField.rowGrid[rightWeaponRowIndex][rightWeaponColIndex].color = colourFront;

        battleField.rowGrid[leftEngineRowIndex][leftEngineColIndex].color = colourBack;
        battleField.rowGrid[rightEngineRowIndex][rightEngineColIndex].color = colourBack;

        return battleField;
    }
}


export class TableContent {
    constructor(public index, public color: string) {}
}

// static wrapAround(sizeX: number, sizeY: number, indexX: number, indexY: number){
//     let newX: number;
//     let newY: number;
//     if (indexX >= sizeX){
//         newX = indexX - sizeX;
//     }
//     else if (indexX < 0){
//         newX = indexX + sizeX;
//     }
//     else{newX = indexX}
//     if (indexY >= sizeY){
//         newY = indexY - sizeY;
//     }
//     else if (indexY < 0){
//         newY = indexY + sizeY;
//     }
//     else{newY = indexY}
//     return{X: newX, Y: newY}