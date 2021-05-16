import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AdminEventsListPageComponent } from './admin-events-list-page.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {UserService} from '../../../data/services/user.service';

describe('AdminEventsListPageComponent', () => {
  let component: AdminEventsListPageComponent;
  let fixture: ComponentFixture<AdminEventsListPageComponent>;

  const userService = jasmine.createSpyObj('UserService', [
    'search_event', 'pipe', 'readEvents'
  ]);
  const search_event = userService.search_event.and.returnValue(of([]));
  const pipe = userService.pipe.and.returnValue(of([]));
  const readEvents = userService.readEvents.and.returnValue(of([]));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdminEventsListPageComponent ],
      providers: [{provide: UserService, useValue: userService}],
      schemas: [NO_ERRORS_SCHEMA]
    })
        .compileComponents().then(() => {
      fixture = TestBed.createComponent(AdminEventsListPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('onFilter test', () => {
    component.onFilter(null);
  });

  it('onFilter not null test', fakeAsync(() => {
    component.tm = {};
    component.datePic = new Date();
    component.onFilter({target: {value: 1}});
    tick(600);
  }));

  it('onDatePicker test', () => {
    component.onDatePicker(null);
  });

  it('rowCallback true test', () => {
    component.rowCallback({dataItem: {lock: true}, index: 1});
  });

  it('rowCallback false test', () => {
    component.rowCallback({dataItem: {lock: false}, index: 1});
  });

  it('rowCallback null test', () => {
    component.rowCallback({dataItem: {lock: null}, index: 1});
  });


});
