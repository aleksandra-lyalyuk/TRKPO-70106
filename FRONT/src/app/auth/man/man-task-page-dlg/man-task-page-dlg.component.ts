import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ManService} from '../../../data/services/man.service';
import {Observable, Subscription} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {process, State} from '@progress/kendo-data-query';
import {GridDataResult} from '@progress/kendo-angular-grid';
import {UserService} from '../../../data/services/user.service';

class Point {
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

interface IAbon {
    NAME: string;
    KODP: number;
}

interface IAsuse {
    ADR: string;
    KOD: { KODNUMOBJ: number, KOD_OBJ: number };
}

interface IDog {
    NDOG: string;
    KOD_DOG: number;
}

interface IUser {
    FIO: string;
    ID: number;
}


interface IFile {
    name: string;
    id: number;
    signed: number;
    paper: number;
}


interface IAdr {
    address: string;
    coord: {
        lat: string,
        long: string
    };
}

declare var ymaps: any;

@Component({
    selector: 'app-man-task-page-dlg',
    templateUrl: './man-task-page-dlg.component.html',
    styleUrls: ['./man-task-page-dlg.component.css']
})

export class ManTaskPageDlgComponent implements OnInit, OnDestroy {
    public unSubGetTaskInsp: Subscription;

    public async onView(value) {
        this.viewListofTask = await this.manService.pipe(map(
            data => process(data, this.gridState)));
        await this.manService.getTaskInsp(new Date(value.task.TTIME).toLocaleDateString(), '', localStorage.getItem('email')).subscribe(res => {
            this.viewListofTask['destination']._value = res;
            this.viewListofTask = this.manService.pipe(map(
                data => process(data, this.gridState)));
        });
    }

    @Input() set EditItem(value: any) {
        if (value.task.ADR_YA === null || value.task.LAT === null || value.task.LAN === null || value.task.STATUS === 12) {
            this.adrYANULL = true;
        }
        if (value.task.STATUS === 12) {
            this.readyTask = true;
        }
        if (value.task.STATUS === 1 || value.task.STATUS === 4 || value.task.STATUS === 8) {
            this.statusTask = false;
        } else {
            this.statusTask = true;
        }
        this.onView(value);
        this.listInsp = value.insp;
        this.editItem = value.task;
        this.countFiles = value.task.CNT_FILES;
        this.openedChangeDataItem = value.task;

        this.prim = this.openedChangeDataItem.PRIM;
        this.unSubGetTask = this.manService.getTask(this.openedChangeDataItem.ID_TASK).subscribe(res => {
            this.contactTel = res[0].TEL_CONTACT;
            this.contactFio = res[0].FIO_CONTACT;
            this.contactEmail = res[0].EMAIL_CONTACT;
            this.selectedName = {FIO: this.openedChangeDataItem.FIO, ID: this.openedChangeDataItem.ID_INSPECTOR};
        });

        this.getLookUp(this.openedChangeDataItem.ID_TASK, this.openedChangeDataItem.KODP,
            this.openedChangeDataItem.KOD_DOG, this.openedChangeDataItem.KOD_NUMOBJ, null);

        this.listItems.push({
            address: this.openedChangeDataItem.ADR_YA,
            coord: {
                lat: this.openedChangeDataItem.LAT,
                long: this.openedChangeDataItem.LAN
            }
        });
        this.selectedItem = this.listItems[this.listItems.length - 1];

        // // TODO используем только если kodp = null, Не при открытии окна а при селекте в лукапах
        // // this.manService.getContacts(kodp).pipe(
        // //     tap(res => {
        // //         res = res;
        // //     })
        // // ).subscribe(res => {
        // //     this.contactFio = res[0].FIO
        // //     this.contactEmail = res[0].E_MAIL
        // //     this.contactTel = res[0].TEL
        // // });

        this.datePic = this.timePic = new Date(this.openedChangeDataItem.TTIME);
        if (this.openedChangeDataItem.PURPOSE === 1) {
            this.selectedStatus = this.listStatus[0];
        } else if (this.openedChangeDataItem.PURPOSE === 2) {
            this.selectedStatus = this.listStatus[1];
        } else if (this.openedChangeDataItem.PURPOSE === 3) {
            this.selectedStatus = this.listStatus[2];
        }

        this.disabledSaveChange = !(this.selectedItem !== undefined && this.selectedStatus
            !== undefined && this.selectedName !== null && this.selectedName !== undefined
            && this.datePic !== undefined && this.timePic !== undefined);
        this.openedChange = true;
        this.emptyDOG = false;
    }

    get EditItem() {
        return this.editItem;
    }

    constructor(private changeDetectorRef: ChangeDetectorRef, private manService: ManService, private userService: UserService) {
    }

    public points: Point[] = [];
    public openUploadDialog = false;
    public statusTask = false;
    public errMsg: any;
    public adrYANULL = false;
    public readyTask = false;
    public errOpen = false;
    public uploadFiles: any;
    public view: Observable<GridDataResult>;
    public viewListofTask: Observable<GridDataResult>;
    private unSubLookupDog: Subscription;
    private unSubLookupPay: Subscription;
    private unSubGetTask: Subscription;
    private unSubLookupObj: Subscription;
    public openedChange = false;
    public listObjASUSE: Array<IAsuse> = [];
    public listAbon: Array<IAbon> = [];
    public listDog: Array<IDog> = [];
    public listInsp: Array<IUser> = [];
    public listItems: Array<IAdr> = [];
    public listfIles: Array<IFile> = [];
    public file: IFile;
    public emptyDOG: boolean;
    public countFiles: any;
    public text = '';
    public listStatus = ['не оплачен', 'оплачен'];
    public selectedItem: IAdr;
    public selectedObjASUSE: IAsuse;
    public selectedAbon: IAbon;
    public selectedDog: IDog;
    public selectedName: IUser;
    public datePic: Date;
    public selectedStatus: any;
    public openQuestionSaveChange = false;
    public disabled = true;
    public openedChangeDataItem: any;
    public openFilesDialog = false;
    public nullFiles = false;
    public prim: any;
    public timePic: Date;
    public selectedInsp: any = null;
    public contactFio: any;
    public contactTel: any;
    public contactEmail: any;
    public disabledSaveChange = true;
    public min: Date = new Date(2020, 0, 1);
    public max: Date = new Date(new Date().getFullYear() + 1, new Date().getMonth() + 12, new Date().getDate() + 30);
    public registerForm: FormGroup = new FormGroup({
        date: new FormControl(new Date()),
        time: new FormControl(new Date()),
        comboEdit: new FormControl(),
        comboAim: new FormControl(),
        comboPurpose: new FormControl(),
        comboAdr: new FormControl(),
        comboObj: new FormControl(),
        comboChangeInsp: new FormControl(),
        emptyDOG: new FormControl(),
        comboDogovor: new FormControl(),
        comboAbon: new FormControl(),
        contactFio: new FormControl(),
        contactEmail: new FormControl(),
        contactTel: new FormControl(),
        prim: new FormControl()
    });
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 25
    };

    @Output() close = new EventEmitter<string>();

    private editItem: any;

    public async onChangeTask(event) {
        if (event === 'click reject' || event === 'click cancel') {
            await this.anyChanges(this.openedChangeDataItem);
        } else {
            let street = null;
            let nd = null;
            let city = null;
            await ymaps.geocode(this.selectedItem.address).then(function(res) {
                for (let i = 0; i < res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components.length; i++) {
                    if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'street') {
                        street = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
                    }
                    if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'house') {
                        nd = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
                    }
                    if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'locality') {
                        city = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
                    }
                }
            });
            let purpose;
            if (this.selectedStatus === 'технический аудит') {
                purpose = 1;
            } else if (this.selectedStatus === 'присоединение') {
                purpose = 2;
            } else if (this.selectedStatus === 'контроль ПУ') {
                purpose = 3;
            } else {
                purpose = '';
            }
            const arrDate = this.datePic.toLocaleDateString().split('.');
            const arrTime = this.timePic.toLocaleTimeString().split(':');
            const ttime = new Date(parseInt(arrDate[2]), parseInt(arrDate[1]) - 1, parseInt(arrDate[0]), parseInt(arrTime[0]), parseInt(arrTime[1]), parseInt(arrTime[2]));
            let id_ins;
            if (this.selectedName !== null) {
                id_ins = this.selectedName.ID;
            } else {
                id_ins = '';
            }
            if (this.selectedObjASUSE !== null && this.selectedAbon !== null && this.selectedDog !== null) {
                this.openedChangeDataItem.KOD_NUMOBJ = this.selectedObjASUSE.KOD.KODNUMOBJ;
                this.openedChangeDataItem.KOD_DOG = this.selectedDog.KOD_DOG;
                this.openedChangeDataItem.KODP = this.selectedAbon.KODP;
                this.openedChangeDataItem.KOD_OBJ = this.selectedObjASUSE.KOD.KOD_OBJ;
            } else {
                this.openedChangeDataItem.KOD_NUMOBJ = null;
                this.openedChangeDataItem.KOD_DOG = null;
                this.openedChangeDataItem.KODP = null;
                this.openedChangeDataItem.KOD_OBJ = null;
            }
            await this.manService.changeTask(this.openedChangeDataItem.ID_TASK, this.selectedItem.address, city, street, nd,
                purpose, ttime, id_ins, this.openedChangeDataItem.KOD_OBJ, this.openedChangeDataItem.KOD_DOG, this.openedChangeDataItem.KODP,
                this.openedChangeDataItem.KOD_NUMOBJ, this.contactFio, this.contactEmail, this.contactTel, this.openedChangeDataItem.STATUS,
                this.selectedItem.coord.lat, this.selectedItem.coord.long, this.prim).subscribe(res => {
                if (res['outBinds'].errmsg !== null) {
                    this.errMsg = res['outBinds'].errmsg;
                    this.errOpen = true;
                }
            });
            this.points.push(new Point(parseInt(this.selectedItem.coord.lat), parseInt(this.selectedItem.coord.long)));
            this.changeDetectorRef.detectChanges();
            // await this.setFilterTask();
            if (event === 'save question') {
                // this.opened = false;
                this.closeQuesChange('yes');
                this.text = '';
                this.listItems = [];
                this.selectedItem = null;
                this.selectedStatus = null;
                this.selectedInsp = null;
                this.listObjASUSE = [];
                this.prim = null;
            }
            this.emptyDOG = false;
            if (event === 'click save') {

                await this.manService.getTask(this.openedChangeDataItem.ID_TASK.toString()).subscribe(res => {
                    this.close.emit(JSON.stringify(res));
                });
            }
        }
    }

    public closeQuesChange(status) {
        if (status === 'cancel question' || status === 'yes') {
            this.openQuestionSaveChange = false;
            this.close.emit('canel question');
            this.text = '';
            this.listItems = [];
            this.selectedItem = null;
            this.selectedStatus = null;
            this.selectedInsp = null;
            this.listObjASUSE = [];
            this.prim = null;
        } else {
            this.openQuestionSaveChange = false;
            this.close.emit('canel');
            this.text = '';
            this.listItems = [];
            this.selectedItem = null;
            this.selectedStatus = null;
            this.selectedInsp = null;
            this.listObjASUSE = [];
            this.prim = null;
        }
    }

    public async getLookUp(id_task, kodp, kodDog, kodNumobj, lookUp) {
        if (kodp !== null) {
            kodp = kodp.toString();
        } else {
            kodp = '';
        }
        if (kodDog !== null) {
            kodDog = kodDog.toString();
        } else {
            kodDog = '';
        }
        if (kodNumobj !== null) {
            kodNumobj = kodNumobj.toString();
        } else {
            kodNumobj = '';
        }
        id_task = id_task.toString();
        if (lookUp !== 'asuse') {
            this.listObjASUSE = [];
            this.unSubLookupObj = await this.manService.getLookupObj(id_task, kodp, kodDog).subscribe(res => {
                for (const i of res) {
                    this.listObjASUSE.push({ADR: i.ADDR, KOD: {KODNUMOBJ: i.KOD_NUMOBJ, KOD_OBJ: i.KOD_OBJ}});
                }

                if (this.listObjASUSE.length === 1) {
                    this.selectedObjASUSE = this.listObjASUSE[0];
                } else if (this.openedChangeDataItem.ADR !== null && lookUp !== 'changeADR' && lookUp !== undefined) {
                    this.listObjASUSE = [];
                    this.listObjASUSE.push({
                        ADR: this.openedChangeDataItem.ADR,
                        KOD: {KODNUMOBJ: this.openedChangeDataItem.KOD_NUMOBJ, KOD_OBJ: this.openedChangeDataItem.KOD_OBJ}
                    });
                    this.selectedObjASUSE = this.listObjASUSE[0];
                } else {
                    this.selectedObjASUSE = null;
                }
            });
        }
        if (lookUp !== 'abon') {
            this.listAbon = [];
            this.unSubLookupPay = await this.manService.getLookupPayers(id_task, kodNumobj, kodDog).subscribe(res => {
                for (const i of res) {
                    this.listAbon.push({NAME: i.NAME, KODP: i.KODP});
                }
                if (this.listAbon.length === 1) {
                    this.selectedAbon = this.listAbon[0];
                } else if (this.openedChangeDataItem.PAYER_NAME !== null && lookUp !== 'changeADR' && lookUp !== undefined) {
                    this.listAbon = [];
                    this.listAbon.push({
                        NAME: this.openedChangeDataItem.PAYER_NAME,
                        KODP: this.openedChangeDataItem.KODP
                    });
                    this.selectedAbon = this.listAbon[0];
                } else {
                    this.selectedAbon = null;
                }
            });
        }
        if (lookUp !== 'dog') {
            this.listDog = [];
            this.unSubLookupDog = await this.manService.getLookupDog(id_task, kodNumobj, kodp).subscribe(res => {
                for (const i of res) {
                    this.listDog.push({NDOG: i.NDOG, KOD_DOG: i.KOD_DOG});
                }
                if (this.listDog.length === 1) {
                    this.selectedDog = this.listDog[0];
                } else if (this.openedChangeDataItem.NDOG !== null && lookUp !== 'changeADR' && lookUp !== undefined) {
                    this.listDog = [];
                    this.listDog.push({
                        NDOG: this.openedChangeDataItem.NDOG,
                        KOD_DOG: this.openedChangeDataItem.KOD_DOG
                    });
                    this.selectedDog = this.listDog[0];
                } else {
                    this.selectedDog = null;
                }
            });
        }
    }

    public comboSaveClear(): void {
        this.disabledSaveChange = !(this.selectedItem !== undefined && this.selectedStatus !== undefined && this.selectedName
            !== null && this.selectedName !== undefined && this.datePic !== null && this.timePic !== null);
    }

    public comboChange(): void {
        this.disabled = !(this.selectedItem !== undefined && this.selectedStatus !== undefined && this.selectedInsp
            !== null && this.selectedInsp !== undefined && this.datePic !== null && this.timePic !== null);
    }

    public async comboSaveChange(event): Promise<void> {
        let kodp = null;
        let kodDog = null;
        let kodNumobj = null;
        let lookup = null;

        this.disabledSaveChange = !(this.selectedItem !== undefined && this.selectedStatus !== undefined && this.selectedName
            !== null && this.selectedName !== undefined && this.datePic !== null && this.timePic !== null);
        if (event === this.selectedObjASUSE && event !== undefined) {
            kodNumobj = this.selectedObjASUSE.KOD.KODNUMOBJ;
            lookup = 'asuse';
            await this.getLookUp(this.openedChangeDataItem.ID_TASK, kodp, kodDog, kodNumobj, lookup);
        } else if (event === this.selectedDog && event !== undefined) {
            kodDog = this.selectedDog.KOD_DOG;
            lookup = 'dog';
            await this.getLookUp(this.openedChangeDataItem.ID_TASK, kodp, kodDog, kodNumobj, lookup);
        } else if (event === this.selectedAbon && event !== undefined) {
            kodp = this.selectedAbon.KODP;
            lookup = 'abon';
            await this.getLookUp(this.openedChangeDataItem.ID_TASK, kodp, kodDog, kodNumobj, lookup);
        } else if (event !== undefined && this.selectedItem !== undefined && event.address === this.selectedItem.address) {
            if (this.selectedObjASUSE !== null && this.selectedAbon !== null && this.selectedDog !== null) {
                this.selectedObjASUSE.KOD.KOD_OBJ = null;
                this.selectedObjASUSE.KOD.KODNUMOBJ = null;
                this.selectedAbon.KODP = null;
                this.selectedDog.KOD_DOG = null;
            }
            await this.onChangeTask(null);
            this.unSubGetTask = await this.manService.getTask(this.openedChangeDataItem.ID_TASK).subscribe(res => {
                this.contactTel = res[0].TEL_CONTACT;
                this.contactFio = res[0].FIO_CONTACT;
                this.contactEmail = res[0].EMAIL_CONTACT;
                const r = this.listInsp.filter(value =>
                    value.ID === res[0].ID_INSPECTOR
                );
                this.selectedName = r[0];
                kodp = res[0].KODP;
                kodDog = res[0].KOD_DOG;
                kodNumobj = res[0].KOD_NUMOBJ;
            });
            await this.getLookUp(this.openedChangeDataItem.ID_TASK, kodp, kodDog, kodNumobj, 'changeADR');
            this.selectedAbon = this.selectedDog = this.selectedObjASUSE = null;
        } else if (event === undefined) {
            await this.getLookUp(this.openedChangeDataItem.ID_TASK, kodp, kodDog, kodNumobj, undefined);
            this.selectedAbon = this.selectedDog = this.selectedObjASUSE = null;
        }
    }

    public async anyChanges(item) {
        if (this.selectedDog === null || this.selectedObjASUSE === null || this.selectedAbon === null) {
            if (item.PURPOSE_NAME.length !== this.selectedStatus.length || item.PRIM !== this.prim ||
                item.FIO !== this.selectedName.FIO || item.ADR_YA !== this.selectedItem.address ||
                item.FIO_CONTACT !== this.contactFio || item.TEL_CONTACT !== this.contactTel ||
                item.EMAIL_CONTACT !== this.contactEmail) {
                this.openQuestionSaveChange = true;
            } else if (item.PAYER_NAME !== null || item.ADR !== null || item.NDOG !== null) {
                this.openQuestionSaveChange = true;
            } else {
                this.close.emit('cancel');
                this.openedChange = false;
                this.text = '';
                this.listItems = [];
                this.selectedItem = null;
                this.selectedStatus = null;
                this.selectedInsp = null;
                this.listObjASUSE = [];
                this.prim = null;
            }
        } else if (item.PURPOSE_NAME.length !== this.selectedStatus.length || item.PRIM !== this.prim ||
            item.FIO !== this.selectedName.FIO || item.ADR_YA !== this.selectedItem.address ||
            item.FIO_CONTACT !== this.contactFio || item.TEL_CONTACT !== this.contactTel ||
            item.EMAIL_CONTACT !== this.contactEmail || item.PAYER_NAME !== this.selectedAbon.NAME ||
            item.NDOG !== this.selectedDog.NDOG) {
            this.openQuestionSaveChange = true;
        } else {
            this.close.emit('cancel');
            this.openedChange = false;
            this.text = '';
            this.listItems = [];
            this.selectedItem = null;
            this.selectedStatus = null;
            this.selectedInsp = null;
            this.listObjASUSE = [];
            this.prim = null;
        }
    }

    public onkeydown(event) {
        ymaps.geocode('Россия, Республика Татарстан, Казань,' + event.target.value)
            .then((res) => {
                this.listItems = [];
                this.listItems.push({
                    address: res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
                    coord: {
                        lat: res.geoObjects.get(0).geometry._coordinates[0],
                        long: res.geoObjects.get(0).geometry._coordinates[1]
                    }
                });
                if (res.geoObjects.get(1) !== undefined) {
                    this.listItems.push({
                        address: res.geoObjects.get(1).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
                        coord: {
                            lat: res.geoObjects.get(1).geometry._coordinates[0],
                            long: res.geoObjects.get(1).geometry._coordinates[1]
                        }
                    });
                    if (res.geoObjects.get(2) !== undefined) {
                        this.listItems.push({
                            address: res.geoObjects.get(2).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
                            coord: {
                                lat: res.geoObjects.get(2).geometry._coordinates[0],
                                long: res.geoObjects.get(2).geometry._coordinates[1]
                            }
                        });
                        if (res.geoObjects.get(3) !== undefined) {
                            this.listItems.push({
                                address: res.geoObjects.get(3).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
                                coord: {
                                    lat: res.geoObjects.get(3).geometry._coordinates[0],
                                    long: res.geoObjects.get(3).geometry._coordinates[1]
                                }
                            });
                            if (res.geoObjects.get(4) !== undefined) {
                                this.listItems.push({
                                    address: res.geoObjects.get(4).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
                                    coord: {
                                        lat: res.geoObjects.get(4).geometry._coordinates[0],
                                        long: res.geoObjects.get(4).geometry._coordinates[1]
                                    }
                                });
                            }
                        }
                    }
                }
            });
    }

    async ngOnInit() {
    }

    public getNameFiles(event) {
        this.listfIles = [];
        this.manService.getTaskFiles(this.openedChangeDataItem.ID_TASK).pipe(tap(res => {
            res = res;
        })).subscribe(res => {
            for (const i of res) {
                this.listfIles.push({name: i.FILENAME, id: i.ID_FILE, signed: i.IS_SIGNED, paper: i.PAPER});
            }
            if (this.listfIles.length >= 0) {
                this.openFilesDialog = true;
                this.uploadFiles = {list: this.listfIles, idTask: this.openedChangeDataItem.ID_TASK, status: this.openedChangeDataItem.STATUS};
            } else {
                this.nullFiles = true;
            }
        });
    }

    public closeFilesDialog(event) {
        this.openFilesDialog = false;
    }

    public closeErrDialog(event) {
        this.errOpen = false;
    }

    ngOnDestroy() {
        if (this.unSubLookupDog) {
            this.unSubLookupDog.unsubscribe();
        }
        if (this.unSubLookupObj) {
            this.unSubLookupObj.unsubscribe();
        }
        if (this.unSubLookupPay) {
            this.unSubLookupPay.unsubscribe();
        }
        if (this.unSubGetTask) {
            this.unSubGetTask.unsubscribe();
        }
        if (this.unSubGetTaskInsp) {
            this.unSubGetTaskInsp.unsubscribe();
        }
    }
}
