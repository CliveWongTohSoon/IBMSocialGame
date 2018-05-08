export class ShipModel {

    constructor(public w1_X,
                public w1_Y,
                public w2_X,
                public w2_Y,
                public e1_X,
                public e1_Y,
                public e2_X,
                public e2_Y,
                public dir) {}

    static displayShip(p1, p2) {
        let x = '';

        for (let i = 0; i < 25; i++) {
            x += "<tr>";
            for (let j = 0; j < 25; j++) {
                if ((i == p1.w1_X && j == p1.w1_Y) || (i == p1.w2_X && j == p1.w2_Y)) {
                    x += "<td bgcolor='#990000'></td>"; //red
                } else if ((i == p1.e1_X && j == p1.e1_Y) || (i == p1.e2_X && j == p1.e2_Y)) {
                    x += "<td bgcolor = '#cc0000'></td>";
                } else if ((i == p2.w1_X && j == p2.w1_Y) || (i == p2.w2_X && j == p2.w2_Y)) {
                    x += "<td bgcolor= '#003399'></td>";  //blue
                } else if ((i == p2.e1_X && j == p2.e1_Y) || (i == p2.e2_X && j == p2.e2_Y)) {
                    x += "<td bgcolor= '#007399'></td>";
                } else
                    x += "<td>&nbsp; </td>";
            }
            x += "</tr>";
        }

        // $("#drawing-table").html(x);
    }
}