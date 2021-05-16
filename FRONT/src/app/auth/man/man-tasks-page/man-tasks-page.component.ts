import {Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, EventEmitter, OnDestroy} from '@angular/core';
import {GridDataResult, RowClassArgs, SelectableSettings} from '@progress/kendo-angular-grid';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {process, State} from '@progress/kendo-data-query';
import {map, tap} from 'rxjs/operators';
import {ManService} from '../../../data/services/man.service';
import {Observable, Subscription} from 'rxjs';
import {UserService} from '../../../data/services/user.service';
import {Point} from './point';

interface IUser {
    FIO: string;
    ID: number;
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

interface IAdr {
    address: string;
    coord: {
        lat: string,
        long: string
    };
}


// declare var ymaps: any;

@Component({
    selector: 'app-man-tasks-page',
    templateUrl: './man-tasks-page.component.html',
    styleUrls: ['./man-tasks-page.component.css'],
})
export class ManTasksPageComponent implements OnInit, OnDestroy {
    @ViewChild('dy_aiv', {static: false}) yaDiv: ElementRef;

    public points: Point[] = [];

    constructor(private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder,
                private manService: ManService, private userService: UserService) {
        this.setSelectableSettings(null);
    }

    public view: Observable<GridDataResult>;
    public res: Observable<any[]>;
    public viewListofTask: Observable<GridDataResult>;
    public selectedInspToChange: any;
    public selectedItem: IAdr;
    public openFilesDialog = false;
    public ndFalse = false;
    public nullFiles = false;
    public openQuestionSaveChange = false;
    public openedChangeDataItem: any;
    public text = '';
    public prim: any;
    public windowTop = -80;
    public windowLeft = 630;
    public selectedName: IUser;
    public selectedAbon: IAbon;
    public sendTaskSuccessful = false;
    public selectedDog: IDog;
    public listObjASUSE: Array<IAsuse> = [];
    public datePic = new Date();
    public timePic = new Date();
    public mainDatePic = new Date();
    public selectedStatus: any;
    // public yMaps: any = null;
    public listItems: Array<IAdr> = [];
    public selectedObjASUSE: IAsuse;
    public listStatus = ['не оплачен', 'оплачен'];
    public listInsp: Array<IUser> = [];
    public listAbon: Array<IAbon> = [];
    public listDog: Array<IDog> = [];
    public disabled = true;
    public disabledSaveChange = true;
    public emptyTask = false;
    public inspector = true;
    public contactFio: any;
    public unSubLookupObj: Subscription;
    public unSubLookupPay: Subscription;
    public unSubLookupDog: Subscription;
    public unSubGetTask: Subscription;
    public unSubCheckMarshrut: Subscription;
    public unSubDeleteTask: Subscription;
    public unSubViewListofTask: Subscription;
    public unSubGetTaskInsp: Subscription;
    public unSubAdd: Subscription;
    public errMsg: any;
    public errOpen = false;
    public contactEmail: any;
    public deleteId: any;
    public contactTel: any;
    public delete = false;
    public emptyDOG: boolean;
    public openErrorSend = false;
    public textErrSend: any;
    public sendTaskInspector: any;
    public sendTaskDate: any;
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 25
    };
    public inspRoutesArrArr = [{
        inspRoutesArr: [{
            coord: ['55.784390, 49.120760'],
            addr: ['ул. Марселя Салимжанова, 1, Казань']
        }]
    }];
    public min: Date = new Date(2020, 0, 1);
    public max: Date = new Date(new Date().getFullYear() + 1, new Date().getMonth() + 12, new Date().getDate() + 30);
    public registerForm: FormGroup = new FormGroup({
        date: new FormControl(new Date()),
        time: new FormControl(new Date()),
        combo: new FormControl(),
        comboEdit: new FormControl(),
        comboAim: new FormControl(),
        comboPurpose: new FormControl(),
        comboInsp: new FormControl(),
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
    public map: any;
    public checkboxOnly = false;
    public selectableSettings: SelectableSettings;
    public opened = false;
    private _openedChange = false;
    public set openedChange(value) {
        this._openedChange = value;
        if (value === false) {
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
        }
    }

    public get openedChange() {
        return this._openedChange;
    }

    public countSendTask: any;
    public selectedInsp: any = null;
    public clusterer = {
        preset: 'islands#invertedVioletClusterIcons',
        hasBaloon: false
    };
    public mapIsInit = false;
    public canDeselect = false;
    public selectUsers: string[] = [];
    public onSelectUser: EventEmitter<any> = new EventEmitter();

    public async ngOnInit() {
        this.view = this.manService.pipe(map(
            data => process(data, this.gridState)));
        this.manService.read();
        this.view.subscribe(res => {
            for (const i of res.data) {
                this.listInsp.push({FIO: i.FIO, ID: i.ID_USER});
            }
        });
        this.viewListofTask = this.userService.pipe(map(
            data => process(data, this.gridState)));
        this.unSubGetTaskInsp = await this.manService.getTaskInsp(new Date().toLocaleDateString(), '', localStorage.getItem('email')).subscribe(res => {
            // this.viewListofTask['destination']._value = res;
            this.viewListofTask = this.userService.pipe(map(
                data => process(data, this.gridState)));
        });

        // let yaMap;
        // this.viewListofTask.subscribe(res => {
        //     if (yaMap === undefined && !this.mapIsInit) {
        //         this.mapIsInit = true;
        //         ymaps.ready().then(() => {
        //             yaMap = new ymaps.Map('map', {
        //                 center: [55.784390, 49.120760],
        //                 zoom: 15
        //             });
        //             yaMap.form = this;
        //             yaMap.events.add('contextmenu', function(e) {
        //                 const coord = e.get('coords');
        //                 ymaps.geocode(coord).then(function(res) {
        //                     if (res.geoObjects.get(0) !== undefined) {
        //                         const adr = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted;
        //                         yaMap.form.showNewTasks(adr, coord);
        //                     }
        //                 });
        //             });
        //             this.createPlacemark(yaMap);
        //             this.onSelectUser.subscribe(mRoute => {
        //                 yaMap.geoObjects.removeAll();
        //                 if (mRoute === undefined) {
        //                     this.createPlacemark(yaMap);
        //                 } else {
        //                     yaMap.geoObjects.add(new ymaps.multiRouter.MultiRoute(mRoute, {
        //                         boundsAutoApply: true
        //                     }));
        //                 }
        //             });
        //         });
        //     }
        // });
    }

    public ngOnDestroy() {
        if (this.unSubCheckMarshrut) {
            this.unSubCheckMarshrut.unsubscribe();
        }
        if (this.unSubDeleteTask) {
            this.unSubDeleteTask.unsubscribe();
        }
        if (this.unSubViewListofTask) {
            this.unSubViewListofTask.unsubscribe();
        }
        if (this.unSubGetTaskInsp) {
            this.unSubGetTaskInsp.unsubscribe();
        }
        if (this.unSubAdd) {
            this.unSubAdd.unsubscribe();
        }
    }

    public closeErrDialog(event) {
        this.errOpen = false;
    }

    public indexClickHandler({sender, rowIndex, columnIndex, dataItem, isEdited}) {
        if (!isEdited) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
        }
    }

    public createFormGroup(dataItem: any): FormGroup {
        return this.formBuilder.group({
            time: dataItem.time
        });
    }

    public assignValues(target: any, source: any): void {
        Object.assign(target, source);
    }

    public async indexCloseHandler(args: any) {
        const {formGroup, dataItem} = args;
        if (!formGroup.valid) {
            args.preventDefault();
        } else if (formGroup.dirty) {
            this.assignValues(dataItem, formGroup.value);
            await this.setRoutes();
        }
    }

    public async selectUsersClick(event) {
        if (this.canDeselect) {
            this.canDeselect = false;
            this.selectUsers = [];
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), '', localStorage.getItem('email')).subscribe(res => {
                // this.viewListofTask['destination']._value = res;
                this.setRoutes();
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
            });
            this.onSelectUser.emit(undefined);
            // this.canDeselect = true;
            return;
        } else {
            await this.setFilterTask();
            this.canDeselect = true;
        }

    }

    // private startTimer = false;

    public async setFilterTask() {
        // this.startTimer = false;
        if (this.selectUsers.length > 0) {
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), this.selectUsers[0].toString(), localStorage.getItem('email')).subscribe(res => {
                // this.viewListofTask['destination']._value = res;
                this.setRoutes();
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
                // for (const item of res) {
                //     if (item.STATUS === 14) {
                //         this.startTimer = true;
                //         break;
                //     }
                // }
                // if (this.startTimer) {
                //     setTimeout(_ => {
                //         this.setFilterTask();
                //     }, 5000);
                // }
            });
            this.inspector = false;
        } else {
            this.inspector = true;
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), '', localStorage.getItem('email')).subscribe(res => {

                // this.viewListofTask['destination']._value = res;
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
                // for (const item of res) {
                //     if (item.STATUS === 14) {
                //         this.startTimer = true;
                //         break;
                //     }
                // }
                // if (this.startTimer) {
                //     setTimeout(_ => {
                //         this.setFilterTask();
                //     }, 5000);
                // }
            });
            this.inspRoutesArrArr = [{
                inspRoutesArr: [{
                    coord: ['55.784390, 49.120760'],
                    addr: ['ул. Марселя Салимжанова, 1, Казань']
                }]
            }];
        }


    }

    public setRoutes() {

        if (this.selectUsers.length > 0) {
            const routesArr = {
                referencePoints: [
                    [55.784390, 49.120760]
                ],
                params: {
                    routingMode: 'pedestrian'
                }
            };
            // for (const item of this.viewListofTask['destination']._value) {
            //     if (item.ID_INSPECTOR === this.selectUsers[0] && item.ADR_YA !== null && item.LAN !== null && item.LAT !== null) {
            //         routesArr.referencePoints.push([parseFloat(item.LAT), parseFloat(item.LAN)]);
            //     }
            // }
            this.onSelectUser.emit(routesArr);
        } else {
            this.onSelectUser.emit(undefined);
        }
    }


    public async setSelectableSettings(event) {
        if (event === null) {
            this.selectedInsp = null;
            this.canDeselect = false;
            await this.setFilterTask();
            return;
            // } else if (event.selectedRows.length === 0) {
            //     this.selectedInsp = null;
            //     this.canDeselect = false;
        } else {
            this.selectedInsp = event.selectedRows[0].dataItem.ID_USER;
            await this.setFilterTask();
            this.canDeselect = true;
        }
        this.selectableSettings = {
            checkboxOnly: this.checkboxOnly,
            mode: 'single'
        };
        this.points = [];
    }

    public comboClear(): void {
        this.disabled = true;
    }

    public comboChange(): void {
        this.disabled = !(this.selectedItem !== undefined && this.selectedStatus !== undefined && this.selectedInsp
            !== null && this.selectedInsp !== undefined && this.datePic !== null && this.timePic !== null);
    }


    public onkeydown(event) {
        this.ndFalse = false;
        // ymaps.geocode('Россия, Республика Татарстан, Казань,' + event.target.value)
        //     .then((res) => {
        //         this.listItems = [];
        //         this.listItems.push({
        //             address: res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
        //             coord: {
        //                 lat: res.geoObjects.get(0).geometry._coordinates[0],
        //                 long: res.geoObjects.get(0).geometry._coordinates[1]
        //             }
        //         });
        //         if (res.geoObjects.get(1) !== undefined) {
        //             this.listItems.push({
        //                 address: res.geoObjects.get(1).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
        //                 coord: {
        //                     lat: res.geoObjects.get(1).geometry._coordinates[0],
        //                     long: res.geoObjects.get(1).geometry._coordinates[1]
        //                 }
        //             });
        //             if (res.geoObjects.get(2) !== undefined) {
        //                 this.listItems.push({
        //                     address: res.geoObjects.get(2).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
        //                     coord: {
        //                         lat: res.geoObjects.get(2).geometry._coordinates[0],
        //                         long: res.geoObjects.get(2).geometry._coordinates[1]
        //                     }
        //                 });
        //                 if (res.geoObjects.get(3) !== undefined) {
        //                     this.listItems.push({
        //                         address: res.geoObjects.get(3).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
        //                         coord: {
        //                             lat: res.geoObjects.get(3).geometry._coordinates[0],
        //                             long: res.geoObjects.get(3).geometry._coordinates[1]
        //                         }
        //                     });
        //                     if (res.geoObjects.get(4) !== undefined) {
        //                         this.listItems.push({
        //                             address: res.geoObjects.get(4).properties.get('metaDataProperty').GeocoderMetaData.Address.formatted,
        //                             coord: {
        //                                 lat: res.geoObjects.get(4).geometry._coordinates[0],
        //                                 long: res.geoObjects.get(4).geometry._coordinates[1]
        //                             }
        //                         });
        //                     }
        //                 }
        //             }
        //         }
        //     });
    }

    public async onNewTask(event) {
        let street = null;
        let nd = null;
        let city = null;
        const house = null;
        // await ymaps.geocode(this.selectedItem.address).then(res => {
        //     for (let i = 0; i < res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components.length; i++) {
        //         if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'street') {
        //             street = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
        //         }
        //         if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'house') {
        //             nd = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
        //         }
        //         if (res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].kind === 'locality') {
        //             city = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.Address.Components[i].name;
        //         }
        //     }
        // });
        const adr = this.selectedItem.address;
        let purpose;
        if (this.selectedStatus === 'технический аудит') {
            purpose = 1;
        } else if (this.selectedStatus === 'присоединение') {
            purpose = 2;
        } else if (this.selectedStatus === 'контроль ПУ') {
            purpose = 3;
        } else {
            purpose = null;
        }
        const prim = '';
        const arrDate = this.datePic.toLocaleDateString().split('.');
        const arrTime = this.timePic.toLocaleTimeString().split(':');
        const ttime = new Date(parseInt(arrDate[2]), parseInt(arrDate[1]) - 1, parseInt(arrDate[0]), parseInt(arrTime[0]), parseInt(arrTime[1]), parseInt(arrTime[2]));
        let id_ins;
        if (this.selectedInsp !== null) {
            id_ins = this.selectedInsp.ID;
        } else {
            id_ins = '';
        }
        const lat = this.selectedItem.coord.lat;
        const lan = this.selectedItem.coord.long;
        const s_zulu = null;
        const b_zullu = null;

        this.unSubAdd = await this.manService.addTask(adr, city, street, house, nd, purpose, prim, ttime, id_ins, localStorage.getItem('email'), lat, lan, s_zulu, b_zullu, 1).subscribe(async res => {
            this.listItems = [];
            if (res['outBinds'].errmsg !== null) {
                this.errMsg = res['outBinds'].errmsg;
                this.errOpen = true;
            }
            this.unSubGetTask = this.manService.getTask(res['outBinds'].po_id_task).subscribe(result => {
                this.selectedInspToChange = result[0];
                this.openedChangeDataItem = {task: result[0], insp: this.listInsp};
                this.openedChange = true;
                this.listItems.push({address: result[0].ADR_YA, coord: {lat: result[0].LAT, long: result[0].LAN}});
                this.selectedItem = this.listItems[0];
                this.selectedStatus = this.listStatus[result[0].PURPOSE - 1];
                this.prim = result[0].PRIM;
                this.contactTel = result[0].TEL_CONTACT;
                this.contactFio = result[0].FIO_CONTACT;
                this.contactEmail = result[0].EMAIL_CONTACT;
                const r = this.listInsp.filter(value =>
                    value.ID === result[0].ID_INSPECTOR
                );
                this.selectedName = r[0];
                this.datePic = this.timePic = new Date(result[0].TTIME);
                this.getLookUp(result[0].ID_TASK, result[0].KODP, result[0].KOD_DOG, result[0].KOD_NUMOBJ, null);
            });
            await this.setFilterTask();
        });
        await this.changeDetectorRef.detectChanges();

        const coords = [this.selectedItem.coord.lat, this.selectedItem.coord.long];
        this.points.push(new Point(coords['lat'], coords['long']));
        this.opened = false;
        this.listItems = [];
        this.selectedStatus = null;
        this.selectedInsp = null;

    }

    public getInsp(event, dataItem) {
        this.selectedInspToChange = dataItem;
        const i = 0;
    }

    public close(status) {
        if (status !== 'yes') {
            this.opened = false;
            this.listItems = [];
            this.selectedStatus = null;
            this.selectedInsp = null;
        }
    }


    public open(event) {
        if (this.selectUsers.length > 0) {
            for (const i of this.listInsp) {
                if (parseInt(this.selectUsers[0]) === i.ID) {
                    this.selectedInsp = i;
                }
            }
        }
        this.datePic = this.timePic = new Date(this.mainDatePic);
        this.selectedItem = this.listItems[0];
        this.opened = true;
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
                } else {
                    this.selectedDog = null;
                }
            });
        }
    }

    public async openChange(dataItem) {
        this.openedChangeDataItem = {task: dataItem, insp: this.listInsp};
        this.prim = this.selectedInspToChange.PRIM;
        this.unSubGetTask = await this.manService.getTask(this.selectedInspToChange.ID_TASK).subscribe(res => {
            this.contactTel = res[0].TEL_CONTACT;
            this.contactFio = res[0].FIO_CONTACT;
            this.contactEmail = res[0].EMAIL_CONTACT;
            const r = this.listInsp.filter(value =>
                value.ID === res[0].ID_INSPECTOR
            );
            this.selectedName = r[0];
        });

        await this.getLookUp(this.selectedInspToChange.ID_TASK, this.selectedInspToChange.KODP,
            this.selectedInspToChange.KOD_DOG, this.selectedInspToChange.KOD_NUMOBJ, null);

        this.listItems.push({
            address: this.selectedInspToChange.ADR_YA,
            coord: {
                lat: this.selectedInspToChange.LAT,
                long: this.selectedInspToChange.LAN
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

        this.datePic = this.timePic = new Date(this.selectedInspToChange.TTIME);
        if (this.selectedInspToChange.PURPOSE === 1) {
            this.selectedStatus = this.listStatus[0];
        } else if (this.selectedInspToChange.PURPOSE === 2) {
            this.selectedStatus = this.listStatus[1];
        } else if (this.selectedInspToChange.PURPOSE === 3) {
            this.selectedStatus = this.listStatus[2];
        }

        this.disabledSaveChange = !(this.selectedItem !== undefined && this.selectedStatus
            !== undefined && this.selectedName !== null && this.selectedName !== undefined
            && this.datePic !== undefined && this.timePic !== undefined);
        this.openedChange = true;
        this.emptyDOG = false;
    }

    public async closeChange(status) {
        if (status === 'cancel question' || status === 'cancel') {
            this.openedChange = false;
            this.nullFiles = false;
        } else if (status.length > 50) {
            this.selectUsers = [];
            this.selectUsers.push(JSON.parse(status)[0].ID_INSPECTOR);
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), this.selectUsers[0].toString(), localStorage.getItem('email')).subscribe(res => {
                // this.viewListofTask['destination']._value = res;
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
            });
            await this.setSelectableSettings({selectedRows: [{dataItem: {ID_USER: JSON.parse(status)[0].ID_INSPECTOR}}]});
            this.openedChange = false;
            this.nullFiles = false;
        } else {
            await this.setFilterTask();
            this.openedChange = false;
            this.nullFiles = false;
        }
        this.listItems = [];
        this.selectedStatus = null;
        this.selectedInsp = null;
    }

    public closeErrorSend(status) {
        this.openErrorSend = false;
    }

    public async onDatePicker(event) {
        if (this.selectUsers.length > 0) {
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), this.selectUsers[0].toString(), localStorage.getItem('email')).subscribe(res => {
                // this.viewListofTask['destination']._value = res;
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
            });
        } else {
            this.viewListofTask = await this.manService.pipe(map(
                data => process(data, this.gridState)));
            await this.manService.getTaskInsp(this.mainDatePic.toLocaleDateString(), '', localStorage.getItem('email')).subscribe(res => {
                // this.viewListofTask['destination']._value = res;
                this.viewListofTask = this.manService.pipe(map(
                    data => process(data, this.gridState)));
            });
        }
    }

    public closeSendSuc(status) {
        this.sendTaskSuccessful = false;
    }

    // public async sendTask(event, dataItem) {
    //     if (dataItem['destination']._value[0] !== undefined) {
    //         this.sendTaskDate = dataItem['destination']._value[0].TTIME.split('T')[0].split('-')[2] +
    //             '.' + dataItem['destination']._value[0].TTIME.split('T')[0].split('-')[1] + '.' +
    //             dataItem['destination']._value[0].TTIME.split('T')[0].split('-')[0];
    //         this.sendTaskInspector = dataItem['destination']._value[0].ID_INSPECTOR.toString();
    //         // this.unSubCheckMarshrut = this.manService.checkMarshrut(this.sendTaskDate, this.sendTaskInspector).subscribe(async res => {
    //         //    else {
    //         await this.manService.sendTask(this.sendTaskDate, this.sendTaskInspector).subscribe(res => {
    //             if (res['outBinds'].status === 0) {
    //                 this.countSendTask = res['outBinds'].po_cnt_sended_task;
    //                 this.sendTaskSuccessful = true;
    //             }
    //             if (res['outBinds'].status !== 0) {
    //                 this.openErrorSend = true;
    //                 this.textErrSend = res['outBinds'].errmsg;
    //                 this.countSendTask = res['outBinds'].po_cnt_sended_task;
    //             }
    //         });
    //         await this.setFilterTask();
    //         // }
    //         // });
    //     }
    // }

    public closeDelete(event) {
        this.delete = false;
    }

    public async deleteTask(event) {
        this.unSubDeleteTask = await this.manService.deleteTask(this.deleteId).subscribe(res => {
            console.log(res);
            if (res['outBinds'].errmsg === null) {
                this.setFilterTask();
            } else {
                this.errMsg = res['outBinds'].errmsg;
                this.errOpen = true;
            }
        });
        this.delete = false;
    }

    public deletConfirm(dataItem, event) {
        this.deleteId = dataItem.ID_TASK;
        this.delete = true;
    }

    public rowCallback = (context: RowClassArgs) => {
        this.emptyTask = context.dataItem.NDOG === null || context.dataItem.PAYER_NAME === null;
        if ((context.dataItem.NDOG === null || context.dataItem.PAYER_NAME === null) && context.index % 2 === 0) {
            return {invalidinsp1: true};
        } else if ((context.dataItem.NDOG === null || context.dataItem.PAYER_NAME === null) && context.index % 2 !== 0) {
            return {invalidinsp2: true};
        } else if ((context.dataItem.NDOG !== null || context.dataItem.PAYER_NAME !== null) && context.index % 2 === 0) {
            return {};
        }
    };
    public rowDisable = (context: RowClassArgs) => {
        switch (context.dataItem.USER_LOCK === 1) {
            case true:
                return {gold: true};
            case false:
                return {green: true};
            default:
                return {};
        }
    };
}
