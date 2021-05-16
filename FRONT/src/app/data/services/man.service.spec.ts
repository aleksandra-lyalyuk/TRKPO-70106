import { TestBed } from '@angular/core/testing';
import {ManService} from './man.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {defer, Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {AuthService} from "../../shared/services/auth.service";

export function asyncError<T>(errorObject: any) {
    return defer(() => Promise.reject(errorObject));
}

describe('ManServiceTest', () => {
    let manService: ManService;
    let httpClientSpy: {post: jasmine.Spy};
    let authServiceSpy: {getToken: jasmine.Spy};

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout', 'setTokenInternal']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                {provide: HttpClient, useValue: httpClientSpy},
                {provide: AuthService, useValue: authServiceSpy}
            ]
        });

        manService = TestBed.get(ManService);
        window.localStorage.clear();
    });

    it('should be created', () => {
        expect(manService).toBeDefined();
    });

    it('read should return expected result', () => {
        const expectedResult = ['test'];
        httpClientSpy.post.and.returnValue(of(expectedResult));

        manService.read();
    });

    it('should return expected result', () => {
        const expectedResult = ['test'];

        httpClientSpy.post.and.returnValue(of(expectedResult));

        manService._read('', '').subscribe(
            res => expect(res).toEqual(expectedResult),
            fail
        );

        expect(httpClientSpy.post.calls.count()).toBe(1);
    });

    it('should return fail', () => {
        const errorResponse = new HttpErrorResponse({
            error: 'test 401 error',
            status: 401, statusText: 'Not Found'
        });
        let getToken = authServiceSpy.getToken.and.returnValue(of({token: ''}));

        httpClientSpy.post.and.returnValue(throwError(errorResponse));

        manService._read('', '').subscribe();

        getToken = authServiceSpy.getToken.and.returnValue(of({token: undefined}));

        manService._read('', '').subscribe();
    });

    it('addTask should return expected result', () => {
        const expectedResult = ['test'];

        httpClientSpy.post.and.returnValue(of(expectedResult));

        manService.addTask('', '', '', '', '', '', '',
            new Date(), '', '', '', '', '', '', '').subscribe(
            res => expect(res).toEqual(expectedResult),
            fail
        );

        manService.getObj('');

        manService.sendTask(new Date(), '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.checkMarshrut(new Date(), '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getContacts('').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getTask('').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getTaskInsp(new Date(), '', '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getLookupObj('', '', '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getLookupPayers('', '', '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getLookupDog('', '', '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getHistory('', '', '', '', '', '', '', '').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getObjAsuse('').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.getTaskFiles('').subscribe(
            res => expect(res).toEqual(expectedResult)
        );

        manService.deleteTask('').subscribe(
            res => expect(res).toEqual(expectedResult)
        );
    });
});
