import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmSelfPageComponent } from './adm-self-page.component';
import {FormsModule} from '@angular/forms';
import {UserService} from '../../../data/services/user.service';
import {AuthService} from '../../../shared/services/auth.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('AdmSelfPageComponent', () => {
    let component: AdmSelfPageComponent;
    let fixture: ComponentFixture<AdmSelfPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
            declarations: [ AdmSelfPageComponent ],
            providers: [UserService, AuthService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdmSelfPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
