import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManFilesDlgComponent } from './man-files-dlg.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {ManService} from '../../../data/services/man.service';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {IFile} from './i-file';

describe('ManFilesDlgComponent', () => {
  let component: ManFilesDlgComponent;
  let fixture: ComponentFixture<ManFilesDlgComponent>;
  let debugElement: DebugElement;
  const file = {
    id: 123,
    name: 'name',
    paper: 123,
    signed: 123
  };

  const mockEditItem = {
    list: [file],
    idTask: 'idTask',
    status: 'status'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [ ManFilesDlgComponent ],
      providers: [ManService, MockManService],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(ManFilesDlgComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement;
      fixture.detectChanges();

      component.EditItem = mockEditItem;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('EditItem should be set', () => {
    expect(component.listfIles).toBe(mockEditItem.list);
    expect(component.idTask).toBe(mockEditItem.idTask);
    expect(component.status).toBe(mockEditItem.status);
  });

  describe('test upload actions', () => {
    let uploadFileInput: any;
    let signedActDlgButton: any;
    let closeSignedDlgButton: any;
    let uploadPaperInput: any;
    let closeFilesButton: any;
    let deleteFileButton: any;
    const inputEvent = new Event('change');
    const clickEvent = new Event('click');

    beforeEach(() => {
      uploadFileInput = debugElement.query(By.css('input[id=uploadFile]')).nativeElement;
      signedActDlgButton = debugElement.query(By.css('button[id=signedActDlgButton]')).nativeElement;
      closeFilesButton = debugElement.query(By.css('button[id=closeFilesButton]')).nativeElement;
    });

    it('upload file test', () => {
      uploadFileInput.value = '';
      uploadFileInput.dispatchEvent(inputEvent);
      fixture.detectChanges();
    });

    it('upload paper test', () => {
      signedActDlgButton.dispatchEvent(clickEvent);
      fixture.detectChanges();
      expect(component.signedAct).toBeTruthy();

      uploadPaperInput = debugElement.query(By.css('input[id=uploadPaper]')).nativeElement;
      uploadPaperInput.value = '';
      uploadPaperInput.dispatchEvent(inputEvent);
      fixture.detectChanges();

      closeSignedDlgButton = debugElement.query(By.css('button[id=closeSignedDlgButton]')).nativeElement;
      closeSignedDlgButton.dispatchEvent(clickEvent);
      fixture.detectChanges();
      expect(component.signedAct).toBeFalsy();
    });

    it('close files button test', () => {
      closeFilesButton.dispatchEvent(clickEvent);
      fixture.detectChanges();
    });

    // it('delete file button test', () => {
    //   deleteFileButton = debugElement.query(By.css('button[id=deleteFileButton]')).nativeElement;
    //   deleteFileButton.dispatchEvent(clickEvent);
    //   fixture.detectChanges();
    // });

  });

});

class MockManService {
  public uploadFile(id, signed, paper, fileToUpload: File) {
    const response = {
      message: 'empty response'
    };
    return of(response);
  }
}

