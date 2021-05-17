import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../shared/services/auth.service';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {FileInfo} from '@progress/kendo-angular-upload';

@Injectable({
        providedIn: 'root'
    }
)

export class ManService extends BehaviorSubject<any[]> {
    constructor(public http: HttpClient, public authService: AuthService) {
        super([]);
    }

    private data: any[] = [];

    private result: Observable<any[]>;

    public read() {
        this._read().pipe(
            tap(res => {
                this.data = res;
            })
        ).subscribe(res => {
            super.next(res);
        });
    }

    public _read(action: string = '', data?: any): Observable<any[]> {
        const allHeaders = {
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        this.result = this.http.post('/authorised/manusers/inspectors', null).pipe(
            map(res => <any[]> res),
            catchError(selector => {
                if (selector.status === 401) {
                    this.authService.getToken().subscribe((tokenResult: any) => {
                        if (tokenResult.token === undefined) {
                            this.authService.logout();
                            this.authService.setTokenInternal(null);
                            // window.location.reload();
                        } else {
                            // window.location.reload();
                        }
                    });
                }
                return of([]);
            })
        );
        return this.result;
    }

    public addTask(adr, city, street, house, nd, purpose, prim, ttime, id_ins, email, lat, lan, s_zulu, b_zullu, ststus) {
        const jsonParam = {
            'address': adr,
            'city': city,
            'street': street,
            'korpus': '',
            'house': nd,
            'purpose': purpose,
            'prim': '',
            'time': ttime.toLocaleDateString() + ' ' + ttime.toLocaleTimeString(),
            'id_ins': id_ins,
            'email': email,
            'lat': lat,
            'lan': lan,
            'szulu': '',
            'bzulu': '',
            'status': ststus
        };
        return this.http.post<any[]>('/authorised/manusers/add_task', JSON.stringify(jsonParam)).pipe(
        );
    }

    public changeTask(id_task, adr_ya, city, street, nd, purpose, time, id_insp, kod_obj, kod_dog, kodp, kod_numobj, fio_contact, email_contact, tel_contact, status, lat, lan, prim) {
        const jsonParam = {
            'id_task': id_task,
            'address_ya': adr_ya,
            'city': city,
            'street': street,
            'korpus': null,
            'house': nd,
            'purpose': purpose,
            'prim': prim,
            'time': time.toLocaleDateString() + ' ' + time.toLocaleTimeString(),
            'id_ins': id_insp,
            'lat': lat,
            'lan': lan,
            'kod_obj': kod_obj,
            'kod_dog': kod_dog,
            'kodp': kodp,
            'kod_num_obj': kod_numobj,
            'szulu': '',
            'bzulu': '',
            'status': status,
            'puser': localStorage.getItem('email'),
            'fio_contact': fio_contact,
            'email_contact': email_contact,
            'tel_contact': tel_contact
        };
        return this.http.post('/authorised/manusers/change_task', JSON.stringify(jsonParam))
            .pipe();
    }

    public getObj(text) {
        this.http.post('/authorised/manusers/get_obj', text)
            .subscribe(response => {
                return response;
            });
    }


    public sendTask(date, id): Observable<any[]> {
        const allHeaders = {
            'nowDate': date,
            'id_insp': id,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/send_tasks', null, {headers: allHeaders}).pipe();
    }

    public checkMarshrut(date, id): Observable<any[]> {
        const allHeaders = {
            'dtc': date,
            'id_ins': id,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/check_marshrut', null, {headers: allHeaders}).pipe();
    }

    public getContacts(kodp): Observable<any[]> {
        const allHeaders = {
            'kodp': kodp,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_contacts', null, {headers: allHeaders}).pipe();
    }

    public getTask(id): Observable<any[]> {
        const allHeaders = {
            'id_task': id.toString(),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_task', null, {headers: allHeaders}).pipe();
    }

    public getTaskInsp(date, idInsp, puser): Observable<any[]> {
        const allHeaders = {
            'datePic': date,
            'id_insp': idInsp,
            'puser': puser,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_task_inspector', null, {headers: allHeaders}).pipe();
    }

    public getLookupObj(idTask, kodp, kodDog): Observable<any[]> {
        const allHeaders = {
            'pid_task': idTask,
            'pkodp': kodp,
            'pkod_dog': kodDog,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_list_obj_lookup', null, {headers: allHeaders}).pipe();
    }

    public getLookupPayers(idTask, kodNumobj, kodDog): Observable<any[]> {
        const allHeaders = {
            'pid_task': idTask,
            'pkod_numobj': kodNumobj,
            'pkod_dog': kodDog,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_list_payers_lookup', null, {headers: allHeaders}).pipe();
    }

    public getLookupDog(idTask, kodNumobj, kodp): Observable<any[]> {
        const allHeaders = {
            'pid_task': idTask,
            'pkod_numobj': kodNumobj,
            'pkodp': kodp,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_list_dogovors_lookup', null, {headers: allHeaders}).pipe();
    }

    public getHistory(dateS, datePo, koddog, kodobj, kodp, id, sort, order): Observable<any[]> {
        const allHeaders = {
            'dateS': dateS,
            'datePo': datePo,
            'koddog': koddog,
            'kodobj': kodobj,
            'kodp': kodp,
            'idIns': id,
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/get_history', null, {headers: allHeaders}).pipe();
    }

    public getObjAsuse(string): Observable<any[]> {
        const jsonPar = {
            str: string
        };
        return this.http.post<any[]>('/authorised/manusers/obj_asuse', JSON.stringify(jsonPar)).pipe();
    }

    public getTaskFiles(id): Observable<any[]> {

        const allHeaders = {
            'pid_task': id.toString(),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/task_files', null, {headers: allHeaders}).pipe();

    }

    public deleteTask(id): Observable<any[]> {
        const allHeaders = {
            'pid_task': id.toString(),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/delete_task', null, {headers: allHeaders}).pipe();
    }

    public deleteFile(idTask, idFile): Observable<any[]> {
        const allHeaders = {
            'pid_task': idTask.toString(),
            'pid_file': idFile.toString(),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        return this.http.post<any[]>('/authorised/manusers/delete_file', null, {headers: allHeaders}).pipe();
    }

    // uploadFile(fileToUpload: FileInfo): Observable<any> {
    //     const endpoint = '/authorised/manusers/upload_file';
    //     const formData: FormData = new FormData();
    //     formData.append('src', fileToUpload, fileToUpload.name);
    //     return this.http.post(endpoint, formData).pipe();
    //     // .catch((e) => console.log(e));
    // }
    uploadFile(id, signed, paper, fileToUpload: File): Observable<any> {
        const allHeaders = {
            'pid_task': id,
            'signed': signed.toString(),
            'paper': paper.toString(),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        const endpoint = '/authorised/manusers/upload_file';
        const formData: FormData = new FormData();
        formData.append('src', fileToUpload, fileToUpload.name);
        return this.http.post(endpoint, formData, {headers: allHeaders}).pipe();
        // .catch((e) => console.log(e));
    }
}
