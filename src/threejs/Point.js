import { MathUtils } from "./three.module";

class Point {
    static distance = (a,b) => Math.sqrt((a[0]- b[0])*(a[0]- b[0])+(a[1]- b[1])*(a[1]- b[1]));
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export default Point;