import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ManWorkInspectorsPageComponent } from './man-work-inspectors-page.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('ManWorkInspectorsPageComponent', () => {
  let component: ManWorkInspectorsPageComponent;
  let fixture: ComponentFixture<ManWorkInspectorsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ManWorkInspectorsPageComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManWorkInspectorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
