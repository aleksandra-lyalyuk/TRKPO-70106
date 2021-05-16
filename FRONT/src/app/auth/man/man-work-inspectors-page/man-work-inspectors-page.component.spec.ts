import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ManWorkInspectorsPageComponent } from './man-work-inspectors-page.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {ManService} from '../../../data/services/man.service';

describe('ManWorkInspectorsPageComponent', () => {
  let component: ManWorkInspectorsPageComponent;
  let fixture: ComponentFixture<ManWorkInspectorsPageComponent>;

  const manService = jasmine.createSpyObj('ManService', [
    'pipe', 'getHistory', '_read', 'getObjAsuse'
  ]);
  const pipe = manService.pipe.and.returnValue(of([]));
  const getHistory = manService.getHistory.and.returnValue(of([]));
  const _read = manService._read.and.returnValue(of([{FIO: 'fio', ID_USER: 'id_user'}, {FIO: 'fio', ID_USER: 'id_user'}]));
  const getObjAsuse = manService.getObjAsuse.and.returnValue(of([
    {KODP: '', NAME: '', KOD_DOG: '', KOD_OBJ: ''},
    {KODP: '', NAME: '', KOD_DOG: '', KOD_OBJ: ''}
  ]));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ManWorkInspectorsPageComponent ],
      providers: [{provide: ManService, useValue: manService}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(ManWorkInspectorsPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
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

  it('getDogPayers test', () => {
    component.getDogPayers({target: {value: [{}, {}, {}, {}, {}]}});
  });

  it('getLookUpASUSE test', () => {
    component.getLookUpASUSE({target: {value: [{}, {}, {}, {}, {}]}});
  });

  it('search 1 test', () => {
    component.abonOrDog = {RES: '', KOD: {KODP: 1, KODDOG: 2, KODOBJ: 3}};
    component.adrASUSE = {RES: '', KOD: {KODP: 1, KODDOG: 2, KODOBJ: 3}};
    component.search(null);
  });

  it('search 2 test', () => {
    component.abonOrDog = undefined;
    component.adrASUSE = {RES: '', KOD: {KODP: 1, KODDOG: 2, KODOBJ: 3}};
    component.search(null);
  });

  it('search 3 test', () => {
    component.abonOrDog = {RES: '', KOD: {KODP: 1, KODDOG: 2, KODOBJ: 3}};
    component.adrASUSE = undefined;
    component.search(null);
  });

  it('search 4 test', () => {
    component.abonOrDog = undefined;
    component.adrASUSE = undefined;
    component.insp = {FIO: 'fio', ID: 1};
    component.search(null);
  });



});
