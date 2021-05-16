import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventsListPageComponent } from './admin-events-list-page.component';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';

describe('AdminEventsListPageComponent', () => {
  let component: AdminEventsListPageComponent;
  let fixture: ComponentFixture<AdminEventsListPageComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ AdminEventsListPageComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(AdminEventsListPageComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  // describe('test filter', () => {
  //   let searchInput: any;
  //   const inputEvent = new Event('input');
  //
  //   beforeEach(() => {
  //     searchInput = debugElement.query(By.css('input[id=searchField]')).nativeElement;
  //   });
  //
  //   it('', () => {
  //     searchInput.value = 'some search';
  //     searchInput.dispatchEvent(inputEvent);
  //     fixture.detectChanges();
  //   });
  //
  // });
});
