import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { AdmUserEditDlgComponent } from './adm-user-edit-dlg.component';
import {FormsModule} from '@angular/forms';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {UserService} from '../../../data/services/user.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';

describe('AdmUserEditDlgComponent', () => {
  let component: AdmUserEditDlgComponent;
  let fixture: ComponentFixture<AdmUserEditDlgComponent>;
  let debugElement: DebugElement;

  const editItemStub = {
    FIO: 'nkulikov',
    TEL: '+88005553535',
    USER_LOCK: 0,
    ROLELIST: ['adm, man, ins'],
    ID_USER: '180'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdmUserEditDlgComponent ],
      providers: [{
        provide: UserService,
        useClass: UserServiceStub
      }],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(AdmUserEditDlgComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      component.EditItem = editItemStub;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('editItem should be set', () => {
    expect(component.modelOut.FIO).toBe(editItemStub.FIO);

    editItemStub.ROLELIST = null;
    component.EditItem = {...editItemStub};

    expect(component.modelOut['ROLELIST']).toBe(undefined);
  });

  // Pair-by-pair testing technic
  describe('test suite for check reactivity for editForm', () => {
    let telephoneInput: any;
    let courierRoleCheckbox: any;
    let admRoleCheckbox: any;
    let headRoleCheckbox: any;
    let clearPassCheckbox: any;
    let userLockCheckbox: any;

    const changeEvent = new Event('change');
    const inputEvent = new Event('input');

    beforeEach(() => {
      telephoneInput = debugElement.query(By.css('input[id=tel]')).nativeElement;
      courierRoleCheckbox = debugElement.query(By.css('input[id=cb-ins]')).nativeElement;
      admRoleCheckbox = debugElement.query(By.css('input[id=cb-adm]')).nativeElement;
      headRoleCheckbox = debugElement.query(By.css('input[id=cb-man]')).nativeElement;
      clearPassCheckbox = debugElement.query(By.css('input[id=cb-clear-pass]')).nativeElement;
      userLockCheckbox = debugElement.query(By.css('input[id=cb-block]')).nativeElement;
    });

    it ('after clearPass checked result must be true', fakeAsync(() => {
      clearPassCheckbox.checked = true;
      clearPassCheckbox.dispatchEvent(changeEvent);
      fixture.detectChanges();

      expect(component.clear_pass).toBe(true);
    }));

    it('after tel checked result must be true', () => {
      telephoneInput.value = '+71234567789';
      telephoneInput.dispatchEvent(inputEvent);
      fixture.detectChanges();

      expect(component.changesDetector()).toBe(true);
    });

    it('after locked checked result must be true', () => {
      userLockCheckbox.checked = true;
      userLockCheckbox.dispatchEvent(changeEvent);
      fixture.detectChanges();

      expect(component.changesDetector()).toBe(true);
    });

    it('check result must be true after different value of roles', () => {
      courierRoleCheckbox.checked = true;
      courierRoleCheckbox.dispatchEvent(changeEvent);
      fixture.detectChanges();

      expect(component.changesDetector()).toBe(true);

      admRoleCheckbox.checked = true;
      admRoleCheckbox.dispatchEvent(changeEvent);
      fixture.detectChanges();

      expect(component.changesDetector()).toBe(true);

      headRoleCheckbox.checked = true;
      headRoleCheckbox.dispatchEvent(changeEvent);
      fixture.detectChanges();

      expect(component.changesDetector()).toBe(true);
    });
  });

  describe('test suite correct saving form', () => {
    let telephoneInput: any;
    let courierRoleCheckbox: any;
    let admRoleCheckbox: any;
    let headRoleCheckbox: any;
    let clearPassCheckbox: any;
    let userLockCheckbox: any;
    let submitButton: any;

    const changeEvent = new Event('change');
    const inputEvent = new Event('input');
    const clickEvent = new Event('click');

    beforeEach(() => {
      telephoneInput = debugElement.query(By.css('input[id=tel]')).nativeElement;
      courierRoleCheckbox = debugElement.query(By.css('input[id=cb-ins]')).nativeElement;
      admRoleCheckbox = debugElement.query(By.css('input[id=cb-adm]')).nativeElement;
      headRoleCheckbox = debugElement.query(By.css('input[id=cb-man]')).nativeElement;
      clearPassCheckbox = debugElement.query(By.css('input[id=cb-clear-pass]')).nativeElement;
      userLockCheckbox = debugElement.query(By.css('input[id=cb-block]')).nativeElement;
      submitButton = debugElement.query(By.css('button[id=submitBtn]')).nativeElement;
    });

    it('after submit btn clicked', () => {
      submitButton.dispatchEvent(clickEvent);
    });

    it('after clear pass result true', () => {
      clearPassCheckbox.checked = true;
      fixture.detectChanges();

      clearPassCheckbox.dispatchEvent(changeEvent);
      submitButton.dispatchEvent(clickEvent);
    });

    it('after change tel editItem must be updated', fakeAsync(() => {
      telephoneInput.value = '+89005553536';
      fixture.detectChanges();

      telephoneInput.dispatchEvent(inputEvent);
      submitButton.dispatchEvent(clickEvent);
      tick();
      fixture.detectChanges();

      expect(component.EditItem.TEL).toBe('+89005553536');
    }));

    it('after user locked model must be updated', fakeAsync(() => {
      userLockCheckbox.checked = true;
      fixture.detectChanges();

      userLockCheckbox.dispatchEvent(changeEvent);
      submitButton.dispatchEvent(clickEvent);
      tick();
      fixture.detectChanges();

      expect(component.EditItem.USER_LOCK).toBe(1);
    }));

    it('turn off all roles', fakeAsync(() => {
      admRoleCheckbox.checked = true;
      headRoleCheckbox.checked = true;
      courierRoleCheckbox.checked = true;
      fixture.detectChanges();

      admRoleCheckbox.dispatchEvent(changeEvent);
      headRoleCheckbox.dispatchEvent(changeEvent);
      courierRoleCheckbox.dispatchEvent(changeEvent);
      submitButton.dispatchEvent(clickEvent);
      tick();
      fixture.detectChanges();

      expect(component.EditItem['ROLELIST']).toEqual('adm,man,ins');
      expect(component.EditItem['ROLELIST_RU']).toEqual('Администратор,Руководитель,Курьер');
    }));
  });
});

class UserServiceStub {
  public passSetDef(id: any) {
    return !!id;
  }

  public set_tel(id: any, tel: string) {
    return true;
  }

  public userLock(isLocked: boolean, id: any) {
    return true;
  }

  public _set_role(roles: string, userId: any) {
    return new Promise((resolve => {
      resolve();
    }));
  }
}
