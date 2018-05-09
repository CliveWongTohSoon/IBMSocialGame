import { ShipDepartment } from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: Array<TableContent[]>) {} // row grid contain the column array

    static renderGrid(shipDepartment: ShipDepartment, battleField: BattleFieldModel, colourFront: string, colourBack: string) {
        const leftWeaponRowIndex = shipDepartment.leftWeapon.xIndex;
        const leftWeaponColIndex = shipDepartment.leftWeapon.yIndex;

        const rightWeaponRowIndex = shipDepartment.rightWeapon.xIndex;
        const rightWeaponColIndex = shipDepartment.rightWeapon.yIndex;

        const leftEngineRowIndex = shipDepartment.leftEngine.xIndex;
        const leftEngineColIndex = shipDepartment.leftEngine.yIndex;

        const rightEngineRowIndex = shipDepartment.rightEngine.xIndex;
        const rightEngineColIndex = shipDepartment.rightEngine.yIndex;

        // console.log(leftWeaponColIndex, leftWeaponRowIndex, rightWeaponColIndex, rightWeaponRowIndex, leftEngineColIndex, leftEngineRowIndex, rightEngineColIndex, rightEngineRowIndex);
        battleField.rowGrid[leftWeaponRowIndex][leftWeaponColIndex].color = colourFront;
        battleField.rowGrid[rightWeaponRowIndex][rightWeaponColIndex].color = colourFront;

        battleField.rowGrid[leftEngineRowIndex][leftEngineColIndex].color = colourBack;
        battleField.rowGrid[rightEngineRowIndex][rightEngineColIndex].color = colourBack;
        // battleField.rowGrid[5][5].color = 'red';
        // console.log(battleField);

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