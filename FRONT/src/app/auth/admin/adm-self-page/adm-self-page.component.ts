import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {UserService} from "../../../data/services/user.service";
import {tap} from "rxjs/operators";
import {AuthService} from "../../../shared/services/auth.service";
import {Router} from "@angular/router";


@Component({
    selector: 'app-adm-self-page',
    templateUrl: './adm-self-page.component.html',
    styleUrls: ['./adm-self-page.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AdmSelfPageComponent implements OnInit {
    form: FormGroup;
    public typePassword = false;
    public role: any;
    public firstPass: any;
    public secondPass: any;
    public wrongPass = false;
    public rightPass = false;
    public wronglenghtPass = false;
    public oldPass: any;
    public errorOldPass = false;
    public eqPass = false;
    public login: any;

    constructor(private userService: UserService, private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
        this.getLoginAndRole();
    }

    public getLoginAndRole() {


        this.login = localStorage.getItem('email')

        let rolesArr = []
        for (let role of this.authService.roles) {
            if (role.ID_ROLETYPE === 'ins') {
                rolesArr.push(' Курьер')
            }
            if (role.ID_ROLETYPE === 'man') {
                rolesArr.push(" Руководитель")
            }
            if (role.ID_ROLETYPE === 'adm') {
                rolesArr.push(" Администратор")
            }
        }
        this.role = rolesArr.toString()
    }

    public togglePassword(event) {
        this.typePassword = !this.typePassword
    }

    public sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async redirectLogin() {
        await this.sleep(3000)
        // await this.router.navigate(['/login'])
    }

    async onSaveNewPass(event) {
        if (this.firstPass == this.secondPass && this.firstPass.length >= 6) {


            this.authService.saveNewPass(this.oldPass, this.firstPass).pipe(
                tap(res => {
                    if (res['outBinds'].po_error == null) {
                        this.rightPass = true
                        this.redirectLogin().then(function (res) {

                        })
                    } else if (res['outBinds'].po_error === 'Old pass eq New pass') {
                        this.eqPass = true
                    } else {
                        this.errorOldPass = true
                    }
                })
            ).subscribe(res => {
                console.log(res)
            });
        } else if (this.firstPass != this.secondPass && this.firstPass.length >= 6) {
            this.wrongPass = true
        } else if (this.firstPass == this.secondPass && this.firstPass.length <= 6) {
            this.wronglenghtPass = true
        } else if (this.firstPass != this.secondPass && this.firstPass.length <= 6) {
            this.wrongPass = true
            this.wronglenghtPass = true
        }
    }

    public toched(event) {
        this.wrongPass = false
        this.rightPass = false
        this.wronglenghtPass = false
        this.errorOldPass = false
        this.eqPass = false
    }

}
