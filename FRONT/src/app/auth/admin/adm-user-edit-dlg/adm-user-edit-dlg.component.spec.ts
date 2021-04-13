import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmUserEditDlgComponent } from './adm-user-edit-dlg.component';
import {FormsModule} from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {UserService} from '../../../data/services/user.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('AdmUserEditDlgComponent', () => {
  let component: AdmUserEditDlgComponent;
  let fixture: ComponentFixture<AdmUserEditDlgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdmUserEditDlgComponent ],
      providers: [UserService],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmUserEditDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
