import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManTasksPageComponent } from './man-tasks-page.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {of, Subscription} from 'rxjs';
import {By} from '@angular/platform-browser';
import {ManService} from '../../../data/services/man.service';
import {Point} from './point';

describe('ManTasksPageComponent', () => {
  let component: ManTasksPageComponent;
  let fixture: ComponentFixture<ManTasksPageComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    const manService = jasmine.createSpyObj('ManService', [
        'getTaskInsp', 'pipe', 'read', 'addTask', 'getTask', 'getLookupObj', 'getLookupPayers', 'getLookupDog', 'deleteTask'
    ]);
    const getTaskInsp = manService.getTaskInsp.and.returnValue(of([]));
    const pipe = manService.pipe.and.returnValue(of({data: []}));
    const read = manService.read.and.returnValue(of({data: []}));
    const addTask = manService.addTask.and.returnValue(of({outBinds: {errmsg: 'check', po_id_task: 1}}));
    const getTask = manService.getTask.and.returnValue(of([{ADR_YA: '1', LAT: '2', LAN: '3'}]));
    const getLookupObj = manService.getLookupObj.and.returnValue(of([]));
    const getLookupPayers = manService.getLookupPayers.and.returnValue(of([]));
    const getLookupDog = manService.getLookupDog.and.returnValue(of([]));
    const deleteTask = manService.deleteTask.and.returnValue(of([{outBinds: {errmsg: 'check'}}]));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
      declarations: [ ManTasksPageComponent ],
      providers: [{provide: ManService, useValue: manService}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(ManTasksPageComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('openedChange method test', () => {
    component.unSubLookupDog = new Subscription();
    component.unSubLookupDog.closed = false;

    component.unSubLookupObj = new Subscription();
    component.unSubLookupObj.closed = false;

    component.unSubLookupPay = new Subscription();
    component.unSubLookupPay.closed = false;

    component.unSubGetTask = new Subscription();
    component.unSubGetTask.closed = false;

    component.openedChange = false;
    fixture.detectChanges();

    expect(component.unSubLookupDog.closed).toBeTruthy();
    expect(component.unSubLookupObj.closed).toBeTruthy();
    expect(component.unSubLookupPay.closed).toBeTruthy();
    expect(component.unSubGetTask.closed).toBeTruthy();

  });

  it('kendo grid test', () => {
    const kendoGrid = debugElement.query(By.css('kendo-grid[id=kendoGrid]')).nativeElement;
    const cellClickEvent = new Event('cellClick');
    kendoGrid.dispatchEvent(cellClickEvent);
  });

  it('create form group test', () => {
    const formGroup = component.createFormGroup({time: 0});
    fixture.detectChanges();
    expect(formGroup).not.toBeNull();
  });

  it('assign values test', () => {
    const assign = {};
    const source = {name: 'name'};
    component.assignValues(assign, source);
    expect(assign).toEqual(source);
  });

  it('select users click true test', () => {
    component.canDeselect = true;
    fixture.detectChanges();
    component.selectUsersClick(null);
    expect(component.canDeselect).toBeFalsy();
    expect(component.selectUsers).toEqual([]);
  });

  it('close error dialog test', () => {
    component.closeErrDialog(null);
    expect(component.errOpen).toBeFalsy();
  });

  it('combo clear test', () => {
    component.comboClear();
    expect(component.disabled).toBeTruthy();
  });

  it('combo change test', () => {
    component.selectedItem = null;
    component.selectedStatus = {};
    component.selectedInsp = {};
    component.datePic = new Date();
    component.timePic = new Date();
    fixture.detectChanges();
    component.comboChange();
    expect(component.disabled).toBeFalsy();
  });

  it('on key down test', () => {
    component.onkeydown(null);
    expect(component.ndFalse).toBeFalsy();
  });

  it('get insp test', () => {
    component.getInsp(null, 'data-item');
    expect(component.selectedInspToChange).toEqual('data-item');
  });

  it('close test', () => {
    component.close('not yes');
    expect(component.opened).toBeFalsy();
    expect(component.listItems).toEqual([]);
    expect(component.selectedStatus).toEqual(null);
    expect(component.selectedInsp).toEqual(null);
  });

  it('open test', () => {
    const currentDate = new Date();
    component.mainDatePic = currentDate;
    component.selectUsers = ['one', 'two'];
    fixture.detectChanges();
    component.open(null);
    expect(component.datePic).toEqual(currentDate);
    expect(component.timePic).toEqual(currentDate);
    expect(component.opened).toBeTruthy();
  });

  it('close delete test', () => {
    component.closeDelete(null);
    expect(component.delete).toBeFalsy();
  });

  it('delet confirm test', () => {
    component.deletConfirm({ID_TASK: 5}, null);
    expect(component.deleteId).toEqual(5);
    expect(component.delete).toBeTruthy();
  });

  it('close Send Suc test', () => {
    component.closeSendSuc(null);
    expect(component.sendTaskSuccessful).toBeFalsy();
  });

  it('close Error Send test', () => {
    component.closeErrorSend(null);
    expect(component.openErrorSend).toBeFalsy();
  });

  it('Point class test', () => {
    const point = new Point(5, 10);
    expect(point.feature).toEqual([5, 10]);
    expect(point.options).toEqual({draggable: true});
  });

  it('setSelectableSettings test', () => {
    const event = {selectedRows: [
        {
          dataItem: {
            ID_USER: 5
          }
        }
      ]};
    component.setSelectableSettings(event);
  });

  it('onNewTask 1 test', () => {
    component.selectedItem = {address: 'address', coord: {lat: '5', long: '10'}};
    component.selectedStatus = 'технический аудит';
    fixture.detectChanges();
    component.onNewTask(null);
  });

  it('onNewTask 2 test', () => {
    component.selectedItem = {address: 'address', coord: {lat: '5', long: '10'}};
    component.selectedStatus = 'присоединение';
    fixture.detectChanges();
    component.onNewTask(null);
  });

  it('onNewTask 3 test', () => {
    component.selectedItem = {address: 'address', coord: {lat: '5', long: '10'}};
    component.selectedStatus = 'контроль ПУ';
    fixture.detectChanges();
    component.onNewTask(null);
  });

  it('onNewTask 4 test', () => {
    component.selectedItem = {address: 'address', coord: {lat: '5', long: '10'}};
    component.selectedStatus = '';
    fixture.detectChanges();
    component.onNewTask(null);
  });

  it('getLookUp test', () => {
    component.getLookUp(1, null, null, null, 'check1');
  });

  it('openChange test', () => {
    component.listInsp = [];
    component.selectedInspToChange = {ID_TASK: 1, KODP: '', KOD_DOG: '', KOD_NUMOBJ: ''};
    component.listItems = [];
    component.openChange(null);
  });

  it('closeChange 1 test', () => {
    component.closeChange('cancel question');
    expect(component.nullFiles).toBeFalsy();
  });

  it('closeChange 2 test', () => {
    component.closeChange(generateStringWithSpecifiedLength(51));
    expect(component.nullFiles).toBeFalsy();
  });

  it('onDatePicker test', () => {
    component.selectUsers = [];
    component.onDatePicker(null);
  });

  it('deleteTask test', () => {
    component.deleteTask(null);
    expect(component.delete).toBeFalsy();
  });

});

function generateStringWithSpecifiedLength(length) {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() *
        charactersLength)));
  }
  return result.join('');
}
