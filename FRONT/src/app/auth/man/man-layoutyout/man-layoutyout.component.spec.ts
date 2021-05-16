import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManLayoutyoutComponent } from './man-layoutyout.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('ManLayoutyoutComponent', () => {
  let component: ManLayoutyoutComponent;
  let fixture: ComponentFixture<ManLayoutyoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ManLayoutyoutComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(ManLayoutyoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });


});
