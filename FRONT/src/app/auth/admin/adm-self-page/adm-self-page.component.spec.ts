import {async, ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import { AdmSelfPageComponent } from './adm-self-page.component';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../data/services/user.service';
import {AuthService} from '../../../shared/services/auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';
import {of} from 'rxjs';

describe('AdmSelfPageComponent', () => {
    let component: AdmSelfPageComponent;
    let fixture: ComponentFixture<AdmSelfPageComponent>;
    let debugElement: DebugElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
            declarations: [ AdmSelfPageComponent ],
            providers: [
                UserService,
                {provide: AuthService, useClass: MockAuthService}]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(AdmSelfPageComponent);
            component = fixture.componentInstance;
            debugElement = fixture.debugElement;
            fixture.detectChanges();

            window.localStorage.clear();
        });
    }));

    it('should create', () => {
        expect(component).toBeDefined();
    });

    // Pair-by-pair testing technic
    describe('test suite for reset password form', () => {
        let oldPassField: any;
        let newPassField: any;
        let newPassRepeatField: any;
        let submitButton: any;

        const oldPass = 'oldPass';
        const newPass = 'newPass';

        const inputEvent = new Event('input');
        const clickEvent = new Event('click');

        beforeEach(() => {
            oldPassField = debugElement.query(By.css('input[name=oldPass]')).nativeElement;
            newPassField = debugElement.query(By.css('input[name=newPass]')).nativeElement;
            newPassRepeatField = debugElement.query(By.css('input[name=newPassRepeat]')).nativeElement;
            submitButton = debugElement.query(By.css('button[type=submit]')).nativeElement;

            oldPassField.value = '';
            newPassField.value = '';
            newPassRepeatField.value = '';

            oldPassField.focus();
            newPassField.focus();
            newPassRepeatField.focus();
        });

        it('check form are valid', fakeAsync(() => {
            oldPassField.value = oldPass;
            newPassField.value = newPass;
            newPassRepeatField.value = newPass;

            oldPassField.dispatchEvent(inputEvent);
            newPassField.dispatchEvent(inputEvent);
            newPassRepeatField.dispatchEvent(inputEvent);
            tick();
            submitButton.dispatchEvent(clickEvent);

            fixture.detectChanges();
            tick(4000);
            expect(component.rightPass).toBe(true);
        }));

        it('check passwords are not equal and newPass.length <= 6', fakeAsync(() => {
            newPassField.value = 'oldPa';
            newPassRepeatField.value = newPass;

            newPassField.dispatchEvent(inputEvent);
            newPassRepeatField.dispatchEvent(inputEvent);
            tick();
            submitButton.dispatchEvent(clickEvent);

            fixture.detectChanges();
            expect(component.wrongPass).toBe(true);
            expect(component.wronglenghtPass).toBe(true);
        }));
    });
});

class MockAuthService {
    public roles = [{ID_ROLETYPE: 'man'}, {ID_ROLETYPE: 'adm'}, {ID_ROLETYPE: 'ins'}];
    public saveNewPass(oldPass, newPass) {
        const response = {
            outBinds: {
                po_error: 'Old pass eq New pass'
            }
        };

        if (oldPass === 'error') {
            response.outBinds.po_error = 'error';
            return of(response);
        }

        if (oldPass === newPass) {
            return of(response);
        }

        if (oldPass !== newPass) {
            response.outBinds.po_error = null;
            return of(response);
        }
    }
}
