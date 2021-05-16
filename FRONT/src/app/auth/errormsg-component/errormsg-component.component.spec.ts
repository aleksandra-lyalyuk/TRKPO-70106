import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrormsgComponentComponent } from './errormsg-component.component';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';

describe('ErrormsgComponentComponent', () => {
  let component: ErrormsgComponentComponent;
  let fixture: ComponentFixture<ErrormsgComponentComponent>;
  let debugElement: DebugElement;

  const MESSAGE = 'some message';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ErrormsgComponentComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(ErrormsgComponentComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      component.EditItem = MESSAGE;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('EditItem should be set', () => {
    expect(component.message).toBe(MESSAGE);
  });

  describe('test close action', () => {
    let closeButton: any;
    const clickEvent = new Event('click');

    beforeEach(() => {
      closeButton = debugElement.query(By.css('button[id=closeButton]')).nativeElement;
    });

    it('after close button click', () => {
      closeButton.dispatchEvent(clickEvent);
    });

  });

});
