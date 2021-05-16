export class Point {
    constructor(public lat: number, public long: number) {
    }

    public get feature() {
        return [this.lat, this.long];
    }

    public get options() {
        return {
            draggable: true
        };
    }
}
