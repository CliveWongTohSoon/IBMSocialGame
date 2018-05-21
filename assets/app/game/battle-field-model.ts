import { ShipDepartment } from "./ship-model";

export class BattleFieldModel {
    constructor(public rowGrid: Array<TableContent[]>) {} // row grid contain the column array

    static renderGrid(shipDepartment: ShipDepartment, battleField: BattleFieldModel, colourFront: string, colourBack: string) {

        const rightWeaponRowIndex = shipDepartment.departmentArray[3].yIndex, rightWeaponColIndex = shipDepartment.departmentArray[3].xIndex;

        const leftWeaponRowIndex = shipDepartment.departmentArray[2].yIndex, leftWeaponColIndex = shipDepartment.departmentArray[2].xIndex;

        const leftEngineRowIndex = shipDepartment.departmentArray[1].yIndex, leftEngineColIndex = shipDepartment.departmentArray[1].xIndex;

        const rightEngineRowIndex = shipDepartment.departmentArray[0].yIndex, rightEngineColIndex = shipDepartment.departmentArray[0].xIndex;

        /*console.log('Left weapon: (', leftWeaponColIndex, ', ', leftWeaponRowIndex, ') ; ',
             'Right Weapon: (' , rightWeaponColIndex, ', ', rightWeaponRowIndex, ') ; ',
                        'Left Engine: (', leftEngineColIndex, ', ', leftEngineRowIndex, ') ; ',
                       'Right Engine: (', rightEngineColIndex, ', ', rightEngineRowIndex, ')');*/

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