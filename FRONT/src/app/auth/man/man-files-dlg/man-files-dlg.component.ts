import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {map, tap} from 'rxjs/operators';
import {ManService} from '../../../data/services/man.service';
import {IFile} from './i-file';

@Component({
    selector: 'app-man-files-dlg',
    templateUrl: './man-files-dlg.component.html',
    styleUrls: ['./man-files-dlg.component.css']
})
export class ManFilesDlgComponent implements OnInit {
    public listfIles: Array<IFile> = [];
    public file: IFile;
    public idTask: any;
    // public signedFile = false;
    public signedAct = false;
    public status: any;
    @Output() close = new EventEmitter<string>();

    @Input() set EditItem(value: any) {
        this.listfIles = value.list;
        this.idTask = value.idTask;
        this.status = value.status;
    }

    public uploadFile(files: FileList) {
        const fileToUpload = files.item(0);
        this.manService.uploadFile(this.idTask.toString(), 0, 0, fileToUpload).subscribe(() => {
            this.getNameFiles(null);
        });
        // this.signedFile = false;
    }

    public uploadPaper(files: FileList) {
        const fileToUpload = files.item(0);
        this.manService.uploadFile(this.idTask.toString(), 0, 1, fileToUpload).subscribe(() => {
            this.getNameFiles(null);
        });
        this.signedAct = false;
    }

    public uploadPaperSigned(files: FileList) {
        const fileToUpload = files.item(0);
        this.manService.uploadFile(this.idTask.toString(), 1, 1, fileToUpload).subscribe(() => {
            this.getNameFiles(null);
        });
        this.signedAct = false;
    }


    public signedActDlg() {
        this.signedAct = true;
    }

    // public signedFileDlg() {
    //     this.signedFile = true;
    // }

    public closeSignedDlg(event) {
        this.signedAct = false;
    }

    public getNameFiles(event) {
        this.listfIles = [];
        this.manService.getTaskFiles(this.idTask).pipe(tap(res => {
            res = res;
        })).subscribe(res => {
            for (const i of res) {
                this.listfIles.push({name: i.FILENAME, id: i.ID_FILE, signed: i.IS_SIGNED, paper: i.PAPER});
            }
        });
    }

    deleteFile(event) {
        this.manService.deleteFile(this.idTask.toString(), event.toString()).subscribe(res => {
            this.getNameFiles(null);
        });
    }

    public closeFiles(event) {
        this.close.emit('cancel');
    }

    getFile(id: number) {
        window.open(`/authorised/manusers/file/${id}`);
    }

    constructor(private manService: ManService) {
    }

    ngOnInit() {
    }

}
