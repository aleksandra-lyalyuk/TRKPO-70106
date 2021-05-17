import { TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {defer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './auth.service';

export function asyncError<T>(errorObject: any) {
    return defer(() => Promise.reject(errorObject));
}

describe('AuthServiceTest', () => {
    let authService: AuthService;
    let httpClientSpy: {post: jasmine.Spy};

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                {provide: HttpClient, useValue: httpClientSpy},
            ]
        });

        authService = TestBed.get(AuthService);
        window.localStorage.clear();
    });

    it('setTokenInternal test', () => {
        authService.setTokenInternal('token');
        expect(authService.token).toEqual('token');
    });

    it('getTokenInternal 1 test', () => {
        authService.setTokenInternal('token');
        const tokenInternal = authService.getTokenInternal();
        expect(tokenInternal).toEqual('token');
    });

    it('getTokenInternal 2 test', () => {
        authService.getTokenInternal();
    });

    it('logout test', () => {
        authService.logout();
        expect(authService.token).toEqual(null);
    });

    it('isAuthenticated test', () => {
        authService.isAuthenticated();
    });

    it('getRoles test', () => {
        authService.getRoles();
    });

    it('setRoles test', () => {
        authService.setRoles(null);
    });

    it('isAdmin 1 test', () => {
        authService.setRoles([{ID_ROLETYPE: 'adm'}]);
        const b = authService.isAdmin();
        expect(b).toBeTruthy();
    });

    it('isAdmin 2 test', () => {
        authService.setRoles([]);
        const b = authService.isAdmin();
        expect(b).toBeFalsy();
    });

    it('isMan 1 test', () => {
        authService.setRoles([]);
        const b = authService.isMan();
        expect(b).toBeFalsy();
    });

    it('isMan 2 test', () => {
        authService.setRoles([{ID_ROLETYPE: 'man'}]);
        const b = authService.isMan();
        expect(b).toBeTruthy();
    });

    it('isIns 1 test', () => {
        authService.setRoles([]);
        const b = authService.isIns();
        expect(b).toBeFalsy();
    });

    it('isIns 2 test', () => {
        authService.setRoles([{ID_ROLETYPE: 'ins'}]);
        const b = authService.isIns();
        expect(b).toBeTruthy();
    });

    it('generateKeyPair test', () => {
        authService.generateKeyPair();
    });

    it('storeServerKey test', () => {
        authService.storeServerKey({data: {server_key: 1}});
    });

    it('storeTicketForTicket test', () => {
        authService.storeTicketForTicket({data: {server_key: 1, ticket_for_ticket: 1}});
    });

    it('storeTicketForToken test', () => {
        authService.storeTicketForToken(null);
    });

    it('storeToken test', () => {
        authService.storeToken(null);
    });
});
