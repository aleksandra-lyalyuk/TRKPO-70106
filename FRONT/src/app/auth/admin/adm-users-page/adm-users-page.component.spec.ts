import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AdmUsersPageComponent } from './adm-users-page.component';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {PhonePipe} from '../../../data/services/phone.pipe';
import {RouterTestingModule} from '@angular/router/testing';
import {UserService} from '../../../data/services/user.service';
import {of} from 'rxjs';

describe('AdmUsersPageComponent', () => {
  let component: AdmUsersPageComponent;
  let fixture: ComponentFixture<AdmUsersPageComponent>;
  let debugElement: DebugElement;

  const gridData = [{
    FIO: 'Nikita Kulikov',
    TEL: '+88005553535',
    LOGIN: 'nkulikov',
    ID_USER: 1,
    ROLELIST: 'adm,man,ins',
    USER_LOCK: 0
  }];

  beforeEach(async(() => {
    const userService = jasmine.createSpyObj('UserService', ['fetch', 'set_role', 'set_tel', 'passSetDef', 'userLock', 'insertIns']);
    const fetch = userService.fetch.and.returnValue(of(gridData));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdmUsersPageComponent, PhonePipe ],
      providers: [{provide: UserService, useValue: userService}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(AdmUsersPageComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;

      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('check component init', async(() => {
    fixture.detectChanges(); // ngOnInit call

    expect(component.view.data).toEqual(gridData);
  }));

  describe('suite for test cell editing init', () => {
    let inTestData = gridData[0];

    beforeEach(() => {
      inTestData = gridData[0];
    });

    it('expect cell editing function is init', () => {
      component.openedChange(null, inTestData);

      expect(component.openedChangeDataItem).toEqual(inTestData);
    });

    it('check rolelist correct identified', () => {
      // check all roles are true
      component.openedChange(null, inTestData);

      expect(component.adm && component.man && component.ins).toBeTruthy();

      // check only one role are true
      inTestData.ROLELIST = 'adm';
      component.openedChange(null, inTestData);
      expect(component.adm).toBeTruthy();

      inTestData.ROLELIST = 'man';
      component.openedChange(null, inTestData);
      expect(component.man).toBeTruthy();

      inTestData.ROLELIST = 'ins';
      component.openedChange(null, inTestData);
      expect(component.ins).toBeTruthy();

      // check that that two roles are correctly identified (pair-by-pair testing)
      inTestData.ROLELIST = 'adm,ins';
      component.openedChange(null, inTestData);
      expect(component.adm && component.ins).toBeTruthy();

      inTestData.ROLELIST = 'adm,man';
      component.openedChange(null, inTestData);
      expect(component.adm && component.man).toBeTruthy();

      inTestData.ROLELIST = 'man,ins';
      component.openedChange(null, inTestData);
      expect(component.man && component.ins).toBeTruthy();
    });
  });

  describe('test suite for check row editing', () => {
    let testData = gridData[0];

    beforeEach(() => {
      testData = gridData[0];
    });

    it('check onChange init', () => {
      component.openedChange(null, testData);
      component.onChange(null);
    });

    it('telephone and userLock correctly set', () => {
      testData.TEL = undefined;
      testData.USER_LOCK = 1;

      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.TEL).toEqual(undefined);
      expect(component.openedChangeDataItem.USER_LOCK).toEqual(1);
    });

    it('roles correctly changes', () => {
      testData.ROLELIST = 'adm,man,ins';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = 'adm,ins';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = 'adm,man';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = 'adm';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = 'man';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = 'ins';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);

      testData.ROLELIST = '';
      component.openedChange(null, testData);
      component.onChange(null);

      expect(component.openedChangeDataItem.ROLELIST).toEqual(testData.ROLELIST);
    });
  });

  describe('save edited row test suite', () => {
    let testData = gridData[0];

    beforeEach(() => {
      testData = gridData[0];
    });

    it('save default person info', () => {
      component.openedChange(null, testData);
      component.onChange(null);
      component.onNewPersone(null);
    });
  });

  it('modal dialog open function works', () => {
    component.open(null);

    expect(component.opened).toBeTruthy();
  });

  it('modal dialog close function works', () => {
    component.close('saved');

    expect(component.opened).toBeFalsy();
  });

  it('rowCallback works', () => {
    let result = component.rowCallback({dataItem: gridData[0], index: 1});

    expect(result).toEqual({gold: true});

    gridData[0].USER_LOCK = 0;
    result = component.rowCallback({dataItem: gridData[0], index: 1});

    expect(result).toEqual({green: true});

    gridData[0].USER_LOCK = 2;
    result = component.rowCallback({dataItem: gridData[0], index: 1});

    expect(result).toEqual({});
  });

  it('disabled change works', () => {
    component.openedChange(null, gridData[0]);
    component.disabledCange();

    expect(component.disabled).toBeTruthy();

    gridData[0].FIO = null;
    component.openedChange(null, gridData[0]);
    component.disabledCange();
  });
});
