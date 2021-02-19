import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {GridDataResult, RowClassArgs} from '@progress/kendo-angular-grid';
import {UserService} from '../../../data/services/user.service';
import {from, Observable, of, Subscription} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {State, process, DataResult} from '@progress/kendo-data-query';


@Component({
    selector: 'app-adm-users-page',
    templateUrl: './adm-users-page.component.html',
    styleUrls: ['./adm-users-page.component.css'],
    encapsulation: ViewEncapsulation.None
})


export class AdmUsersPageComponent implements OnInit, OnDestroy {
    public windowTop = -80;
    public windowLeft = 630;
    public view: Observable<GridDataResult>;
    public opened = false;
    public openChange = false;
    public onblock = false;
    public disabled = true;
    public openedChangeDataItem: any = undefined;
    public password = false;
    public personFIO: any;
    public personTEL: any;
    public ins: boolean;
    public adm: boolean;
    public unSubGetListUsers: Subscription;
    public man: boolean;
    public delete = false;
    public fio: any;
    public phone: any;
    public blokirator: any;
    public ondelete: boolean;
    public block: boolean;
    public login: any;
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 25
    };

    constructor(private userService: UserService) {
    }

    async ngOnInit() {
        this.view = this.userService.pipe(map(
            data => process(data, this.gridState)));
        this.unSubGetListUsers = await this.userService.fetch().subscribe(res => {
            this.view['destination']._value = res;
            this.view = this.userService.pipe(map(
                data => process(data, this.gridState)));
        });
    }

    public open(event) {
        this.disabled = true;
        this.opened = true;
        this.ins = false;
        this.adm = false;
        this.man = false;
    }


    public openedChange(event, dataItem) {
        this.openedChangeDataItem = dataItem;
        this.openChange = true;
        this.fio = dataItem.FIO;
        this.phone = dataItem.TEL;
        this.login = dataItem.LOGIN;
        this.ondelete = false;
        this.adm = false;
        this.man = false;
        this.ins = false;
        this.password = false;
        if (dataItem.USER_LOCK === 0) {
            this.blokirator = this.onblock = false;
        } else {
            this.blokirator = this.onblock = true;
        }

        if (dataItem.ROLELIST != null) {
            if (dataItem.ROLELIST.length === 3) {
                if (dataItem.ROLELIST[0] === 'a') {
                    this.adm = true;
                    this.ins = false;
                    this.man = false;
                } else if (dataItem.ROLELIST[0] === 'i') {
                    this.ins = true;
                    this.man = false;
                    this.adm = false;
                } else {
                    this.man = true;
                    this.ins = false;
                    this.adm = false;
                }
            } else if (dataItem.ROLELIST.length === 7) {
                if (dataItem.ROLELIST[0] === 'a' && dataItem.ROLELIST[4] === 'i') {
                    this.adm = true;
                    this.ins = true;
                    this.man = false;
                } else if (dataItem.ROLELIST[0] === 'a' && dataItem.ROLELIST[4] === 'm') {
                    this.adm = true;
                    this.man = true;
                    this.ins = false;
                } else {
                    this.ins = true;
                    this.man = true;
                    this.adm = false;
                }
            } else if (dataItem.ROLELIST.length > 7) {
                this.adm = true;
                this.man = true;
                this.ins = true;
            }
        }
    }

    public close(status) {
        console.log(`Dialog result: ${status}`);
        this.opened = false;
        this.openChange = false;
        this.delete = false;
    }

    public blockUser(event, user) {
        console.log(event, user);
        for (const i of this.view['destination']._value) {
            if (i.FIO === user.FIO) {
                if (i.USER_LOCK === 0) {
                    i.USER_LOCK = 1;
                } else {
                    i.USER_LOCK = 0;
                }
            }
        }
    }

    public disabledCange() {
        this.disabled = !(this.personFIO != null && this.personFIO.length != 0);
    }

    public onNewPersone(event) {
        let roleList_ru = [];
        let role = [];
        if (this.ins === true) {
            roleList_ru.push('Курьер');
            role.push('ins');
        }
        if (this.adm === true) {
            roleList_ru.push('Администратор');
            role.push('adm');
        }
        if (this.man === true) {
            roleList_ru.push('Руководитель');
            role.push('man');
        }
        if (role.toString().length === 0) {
            role = [''];
        }
        if (this.personTEL === null || this.personTEL === undefined) {
            this.userService.insertIns(this.personFIO, '', role.toString());
        } else {
            this.userService.insertIns(this.personFIO, this.personTEL, role.toString());
        }

    }

    public deleteUser(event) {
        for (let i = 0; i < this.view['destination']._value.length; i++) {
            if (this.view['destination']._value[i].LOGIN == this.login) {
                this.userService.delete_user(this.view['destination']._value[i].ID_USER);

            }
        }
        window.location.reload();
    }

    public async onChange(event) {
        let roles = '';
        const id = this.openedChangeDataItem.ID_USER;
        let tel;
        if (this.phone !== undefined) {
            this.openedChangeDataItem.TEL = tel = this.phone;
        } else {
            tel = '';
        }
        if (this.onblock === true) {
            this.openedChangeDataItem.USER_LOCK = 1;
        } else {
            this.openedChangeDataItem.USER_LOCK = 0;
        }
        if (this.adm === true && this.man === true && this.ins === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Курьер,Администратор,Руководитель';
            this.openedChangeDataItem.ROLELIST = roles = 'ins,adm,man';
        } else if (this.adm === true && this.ins === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Курьер,Администратор';
            this.openedChangeDataItem.ROLELIST = roles = 'ins,adm';
        } else if (this.adm === true && this.man === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Администратор,Руководитель';
            this.openedChangeDataItem.ROLELIST = roles = 'adm,man';
        } else if (this.man === true && this.ins === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Курьер,Руководитель';
            this.openedChangeDataItem.ROLELIST = roles = 'ins,man';
        } else if (this.adm === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Администратор';
            this.openedChangeDataItem.ROLELIST = roles = 'adm';
        } else if (this.ins === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Курьер';
            this.openedChangeDataItem.ROLELIST = roles = 'ins';
        } else if (this.man === true) {
            this.openedChangeDataItem.ROLELIST_RU = 'Руководитель';
            this.openedChangeDataItem.ROLELIST = roles = 'man';
        } else {
            this.openedChangeDataItem.ROLELIST_RU = '';
            this.openedChangeDataItem.ROLELIST = roles = '';
        }
        this.userService.set_role(roles, id);
        this.userService.set_tel(id, tel);
        if (this.password === true) {
            this.userService.passSetDef(id);
        }
        if (this.onblock === true && this.onblock !== this.blokirator) {
            await this.userService.userLock(1, id);
            await this.deleteUser(null);
        } else if (this.onblock === false && this.onblock !== this.blokirator) {
            this.userService.userLock(0, id);
        }
    }


    public rowCallback = (context: RowClassArgs) => {
        switch (context.dataItem.USER_LOCK) {
            case 1:
                return {gold: true};
            case 0:
                return {green: true};
            default:
                return {};
        }
    };

    ngOnDestroy(): void {
        this.unSubGetListUsers.unsubscribe();
    }
}
