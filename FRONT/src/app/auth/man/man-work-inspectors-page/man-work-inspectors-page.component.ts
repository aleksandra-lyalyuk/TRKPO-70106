import {Component, OnInit} from '@angular/core';
import {RowClassArgs, GridDataResult, DataStateChangeEvent} from '@progress/kendo-angular-grid';
import {State, process} from '@progress/kendo-data-query';
import {FormControl, FormGroup} from '@angular/forms';
import {ManService} from '../../../data/services/man.service';
import {map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';

interface IUser {
    FIO: string;
    ID: number;
}

interface IAbonOrDog {
    RES: string;
    KOD: {
        KODP: number,
        KODDOG: number,
        KODOBJ: number
    };
}

interface IASUSE {
    RES: string;
    KOD: {
        KODP: number,
        KODDOG: number,
        KODOBJ: number
    };
}

@Component({
    selector: 'app-man-work-inspectors-page',
    templateUrl: './man-work-inspectors-page.component.html',
    styleUrls: ['./man-work-inspectors-page.component.css']
})

export class ManWorkInspectorsPageComponent implements OnInit {
    public gridView: any[];
    public eventAsuse: any;
    public inputObject: any;
    public view: Observable<GridDataResult>;
    public dateS = new Date();
    public datePo = new Date();
    public abonOrDog: IAbonOrDog;
    public inputAbonent: any;
    public kod_obj = [];
    public kodp = [];
    public listInsp: Array<IUser> = [];
    public listAbonOrDog: Array<IAbonOrDog> = [];
    public listASUSE: Array<IASUSE> = [];
    public insp: IUser;
    public adrASUSE: IASUSE;
    public gridState: State = {
        skip: 0,
        take: 10,
        filter: {
            logic: 'and',
            filters: [{field: 'data', operator: 'contains', value: ''}]
        }
    };

    public min: Date = new Date(2020, 0, 1);
    public max: Date = new Date();
    public dataValue: Date = new Date();
    public registerForm: FormGroup = new FormGroup({
        date: new FormControl(new Date()),
        abonOrDog: new FormControl(),
        insp: new FormControl(),
        adrASUSE: new FormControl(),
        inputObject: new FormControl(),
        inputAbonent: new FormControl()
    });

    public constructor(private manService: ManService) {
    }

    public async ngOnInit() {
        this.view = this.manService.pipe(map(
            data => process(data, this.gridState)));
        await this.manService.getHistory(this.dateS.toLocaleDateString(), this.datePo.toLocaleDateString(), '', '', '', '', '', '').subscribe(res => {
            // this.view['destination']._value = res;
            this.view = this.manService.pipe(map(
                data => process(data, this.gridState)));
        });

        this.manService._read().subscribe(res => {
            for (const i of res) {
                this.listInsp.push({
                    FIO: i.FIO,
                    ID: i.ID_USER
                });
            }
        });
    }

    public async getLookUpASUSE(event) {
        this.listASUSE = [];
        if (event.target.value.length > 4) {
            await this.manService.getObjAsuse(event.target.value).subscribe(res => {
                for (const i of res) {
                    this.listASUSE.push({RES: i.NAME, KOD: {KODP: i.KODP, KODDOG: i.KOD_DOG, KODOBJ: i.KOD_OBJ}});
                }
            });
        }
    }

    public async getDogPayers(event) {
        this.listAbonOrDog = [];
        if (event.target.value.length > 4) {
            await this.manService.getObjAsuse(event.target.value).subscribe(res => {
                for (const i of res) {
                    this.listAbonOrDog.push({
                        RES: i.NAME,
                        KOD: {KODP: i.KODP, KODDOG: i.KOD_DOG, KODOBJ: i.KOD_OBJ}
                    });
                }
            });
        }
    }


    public async search(event) {
        let koddog;
        let kodobj;
        let kodp;
        let insp;
        if (this.abonOrDog !== undefined && this.adrASUSE !== undefined) {
            koddog = this.adrASUSE.KOD.KODDOG.toString();
            kodp = this.adrASUSE.KOD.KODP.toString();
            kodobj = this.adrASUSE.KOD.KODOBJ.toString();
        } else if (this.abonOrDog === undefined && this.adrASUSE !== undefined) {
            koddog = '';
            kodp = '';
            kodobj = this.adrASUSE.KOD.KODOBJ.toString();
        } else if (this.abonOrDog !== undefined && this.adrASUSE === undefined) {
            koddog = this.abonOrDog.KOD.KODDOG.toString();
            kodp = this.abonOrDog.KOD.KODP.toString();
            kodobj = '';
        } else if (this.abonOrDog === undefined && this.adrASUSE === undefined) {
            koddog = '';
            kodp = '';
            kodobj = '';
        }
        if (this.insp !== undefined) {
            insp = this.insp.ID.toString();
        } else {
            insp = '';
        }
        this.manService.getHistory(this.dateS.toLocaleDateString(), this.datePo.toLocaleDateString(), koddog, kodobj, kodp, insp, '', '').subscribe(res => {
            // this.view['destination']._value = res;
            this.view = this.manService.pipe(map(
                data => process(data, this.gridState)));
        });
    }

    // public async onDatePicker(event) {
    //     await this.manService.getHistory(this.dateS.toLocaleDateString(), this.datePo.toLocaleDateString(), '', '', '', '', '', '').subscribe(res => {
    //         this.view['destination']._value = res;
    //         this.view = this.manService.pipe(map(
    //             data => process(data, this.gridState)));
    //     });
    // }


    public rowCallback = (context: RowClassArgs) => {
        switch (context.dataItem.lock) {
            case true:
                return {gold: true};
            case false:
                return {green: true};
            default:
                return {};
        }
    }
}
