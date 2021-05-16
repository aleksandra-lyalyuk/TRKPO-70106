import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManTaskPageDlgComponent } from './man-task-page-dlg.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {ManService} from '../../../data/services/man.service';

describe('ManTaskPageDlgComponent', () => {
  let component: ManTaskPageDlgComponent;
  let fixture: ComponentFixture<ManTaskPageDlgComponent>;

  const manService = jasmine.createSpyObj('ManService', [
    'pipe', 'getTaskInsp', 'getTask', 'changeTask', 'getLookupObj', 'getLookupPayers', 'getLookupDog', 'getTaskFiles'
  ]);
  const pipe = manService.pipe.and.returnValue(of([]));
  const getTaskInsp = manService.getTaskInsp.and.returnValue(of([]));
  const getTask = manService.getTask.and.returnValue(of([{TEL_CONTACT: '', FIO_CONTACT: '', EMAIL_CONTACT: ''}]));
  const changeTask = manService.changeTask.and.returnValue(of([]));
  const getLookupObj = manService.getLookupObj.and.returnValue(of([]));
  const getLookupPayers = manService.getLookupPayers.and.returnValue(of([]));
  const getLookupDog = manService.getLookupDog.and.returnValue(of([]));
  const getTaskFiles = manService.getTaskFiles.and.returnValue(of([]));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [ ManTaskPageDlgComponent ],
      providers: [{provide: ManService, useValue: manService}],
      schemas: [NO_ERRORS_SCHEMA]
    })
        .compileComponents().then(() => {
      fixture = TestBed.createComponent(ManTaskPageDlgComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('closeQuesChange 1 test', () => {
    component.closeQuesChange('cancel question');
  });

  it('closeQuesChange 2 test', () => {
    component.closeQuesChange(null);
  });

  it('anyChanges test', () => {
    component.selectedStatus = [];
    component.anyChanges({PURPOSE_NAME: ['', '']});
  });

  it('getNameFiles test', () => {
    component.openedChangeDataItem = {ID_TASK: 1};
    component.getNameFiles(null);
  });

  it('onView test', () => {
    component.onView({task: {TTIME: new Date()}});
  });

  it('EditItem test', () => {
    component.openedChangeDataItem = {FIO: '', ID_INSPECTOR: 1, PURPOSE: 1};
    component.EditItem = {task: {ADR_YA: null, LAT: '', STATUS: 12}};
  });

  it('onChangeTask test', () => {
    component.onChangeTask('click reject');
    component.onChangeTask(null);
  });

});
