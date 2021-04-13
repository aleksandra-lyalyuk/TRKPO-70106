import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmUsersPageComponent } from './adm-users-page.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {PhonePipe} from '../../../data/services/phone.pipe';
import {RouterTestingModule} from '@angular/router/testing';

describe('AdmUsersPageComponent', () => {
  let component: AdmUsersPageComponent;
  let fixture: ComponentFixture<AdmUsersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdmUsersPageComponent, PhonePipe ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
