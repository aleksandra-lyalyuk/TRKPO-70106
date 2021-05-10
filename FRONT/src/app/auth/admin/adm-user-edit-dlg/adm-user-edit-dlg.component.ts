import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UserService} from '../../../data/services/user.service';
import {Observable} from "rxjs";

export interface IAdmUserEdit {
    FIO: string;
    TEL: string;
    INS: boolean;
    ADM: boolean;
    MAN: boolean;
    USER_LOCK: boolean;
}

@Component({
    selector: 'app-adm-user-edit-dlg',
    templateUrl: './adm-user-edit-dlg.component.html',
    styleUrls: ['./adm-user-edit-dlg.component.css']
})
export class AdmUserEditDlgComponent implements OnInit {
    @Input() set EditItem(value: any) {
        this.editItem = value;
        let model = {};
        model['FIO'] = value.FIO;
        model['TEL'] = value.TEL;
        model['USER_LOCK'] = value.USER_LOCK != 0;
        if (value.ROLELIST === null) {
            value.ROLELIST = [];
        }
        model['ADM'] = !!value.ROLELIST.includes('adm');
        model['MAN'] = !!value.ROLELIST.includes('man');
        model['INS'] = !!value.ROLELIST.includes('ins');
        this.modelIn = model as IAdmUserEdit;
        Object.assign(this.modelOut, this.modelIn);
    }

    get EditItem() {
        return this.editItem;
    }

    private editItem: any;
    @Output() close = new EventEmitter<string>();
    modelIn: IAdmUserEdit;
    modelOut: IAdmUserEdit = {} as IAdmUserEdit;
    clear_pass = false;


    constructor(public userService: UserService) {

    }

    ngOnInit() {
    }


    async onSaveClick() {
        await this.save();
        this.close.emit('yes');
    }

    async save() {
        if (this.clear_pass) {
            await this.clearPass();
        }
        if (this.modelIn.TEL != this.modelOut.TEL) {
            await this.setTel();
            this.editItem.TEL = this.modelOut.TEL;
        }
        if (this.modelIn.USER_LOCK != this.modelOut.USER_LOCK) {
            await this.userLock();
            this.editItem.USER_LOCK = this.modelOut.USER_LOCK ? 1 : 0;
        }
        let setRolesResult = null;
        if ((this.modelIn.ADM != this.modelOut.ADM) || (this.modelIn.MAN != this.modelOut.MAN) || (this.modelIn.INS != this.modelOut.INS)) {
            setRolesResult = this.setRoles();
        }
        this.updateRow(setRolesResult);
    }

    updateRow(setRolesResult) {

        this.editItem.USER_LOCK = this.modelOut.USER_LOCK ? 1 : 0;
        this.editItem.ADM = this.modelOut.TEL;
        if (setRolesResult != null) {
            this.editItem.ROLELIST = setRolesResult.ROLELIST;
            this.editItem.ROLELIST_RU = setRolesResult.ROLELIST_RU;
        }
    }

    setRoles() {
        const rolesA = [];
        const rolesruA = [];
        if (this.modelOut.ADM) {
            rolesA.push('adm');
            rolesruA.push('Администратор');
        }
        if (this.modelOut.MAN) {
            rolesA.push('man');
            rolesruA.push('Руководитель');
        }
        if (this.modelOut.INS) {
            rolesA.push('ins');
            rolesruA.push('Курьер');
        }
        const roles = rolesA.join(',');
        const roles_ru = rolesruA.join(',');
        return {ROLELIST: roles, ROLELIST_RU: roles_ru};
    }

    async userLock() {
        await this.userService.userLock(this.modelOut.USER_LOCK ? 1 : 0, this.EditItem.ID_USER);
    }

    async clearPass() {
        await this.userService.passSetDef(this.EditItem.ID_USER);
    }

    async setTel() {
        await this.userService.set_tel(this.EditItem.ID_USER, this.modelOut.TEL);
    }

    changesDetector(): boolean {
        let result = false;
        if (this.clear_pass) {
            return true;
        } else {
            if (this.modelIn.TEL != this.modelOut.TEL) {
                result = true;
            }
            if (this.modelIn.ADM != this.modelOut.ADM) {
                result = true;
            }
            if (this.modelIn.MAN != this.modelOut.MAN) {
                result = true;
            }
            if (this.modelIn.INS != this.modelOut.INS) {
                result = true;
            }
            if (this.modelIn.USER_LOCK != this.modelOut.USER_LOCK) {
                result = true;
            }
        }
        return result;
    }

    // enable button save
    canSave = false;

    onEdit(value: any) {
        this.canSave = this.changesDetector()
    }
}
