import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map, mapTo, tap} from 'rxjs/operators';
import * as forge from 'node-forge';
import {Router} from '@angular/router';

@Injectable({
        providedIn: 'root'
    }
)
export class AuthService {

    constructor(private http: HttpClient, private router: Router) {

    }

    email = '';

    token: string;
    roles = [];

    setTokenInternal(token: string) {
        this.token = token;
    }

    getTokenInternal(): string {
        if (this.token === undefined) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    logout() {
        this.token = null;
        localStorage.clear();
    }

    isAuthenticated(): boolean {
        return !!this.getTokenInternal();
    }

    getRoles() {
        return this.roles;
    }

    setRoles(roles) {
        this.roles = roles;
    }

    isAdmin(): boolean {
        for (const role of this.roles) {
            if (role.ID_ROLETYPE === 'adm') {
                return true;
            }
        }
        return false;
    }

    isMan(): boolean {
        for (const role of this.roles) {
            if (role.ID_ROLETYPE === 'man') {
                return true;
            }
        }
        return false;
    }

    isIns(): boolean {
        for (const role of this.roles) {
            if (role.ID_ROLETYPE === 'ins') {
                return true;
            }
        }
        return false;
    }

    generateKeyPair() {
        const keys = forge.pki.rsa.generateKeyPair({bits: 1024, e: 0x10001});
        const clientPubKeyStr = forge.pki.publicKeyToPem(keys.publicKey);
        const clientPrvKeyStr = forge.pki.privateKeyToPem(keys.privateKey);
        localStorage.setItem('clientPubKeyStr', clientPubKeyStr);
        localStorage.setItem('clientPrvKeyStr', clientPrvKeyStr);
    }

    storeServerKey(data: any) {
        if (data !== undefined) {
            if (data.data !== undefined) {
                if (data.data.server_key !== undefined) {
                    localStorage.setItem('serverKey', data.data.server_key);
                }
            }
        }
    }

    storeTicketForTicket(data: any) {
        if (data !== undefined) {
            if (data.data !== undefined) {
                if (data.data.server_key !== undefined) {
                    localStorage.setItem('ticket_for_ticket', data.data.ticket_for_ticket);
                }
            }
        }
    }

    // tslint:disable-next-line:variable-name
    storeTicketForToken(ticket_for_token: any) {
        localStorage.setItem('ticket_for_token', ticket_for_token);
    }

    storeToken(token) {
        localStorage.setItem('token', token);
        // localStorage.setItem('email', this.email);
    }

    getTicketForTicket(pEmail): Observable<any> {
        this.generateKeyPair();

        const allHeaders = {
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json',
            Email: pEmail,
            key: forge.util.encode64(localStorage.getItem('clientPubKeyStr').replace('\r\n', ''))
        };

        return this.http.post('/api/getticketforticket', null, {headers: allHeaders}).pipe(
            map(data => {
                this.storeTicketForTicket(data);
                this.storeServerKey(data);
                return data;
            }),
            catchError(selector => {
                return of(false);
            })
        );
    }

    public getHASH(pass) {
        const md = forge.md.sha256.create();
        md.update(pass);
        return forge.util.encode64(md.digest().toHex());
    }

    getTicketForToken(pass): Observable<{ ticket_for_token: any }> {
        const psHash = this.getHASH(pass);
        const ticketforticketCr = forge.util.decode64(localStorage.getItem('ticket_for_ticket'));
        const clientPrvKeyStr = localStorage.getItem('clientPrvKeyStr');
        const clientPrvKey = forge.pki.privateKeyFromPem(clientPrvKeyStr);
        const ticketforticket = clientPrvKey.decrypt(ticketforticketCr);
        const allHeaders = {
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json',
            ticketforticket
        };
        const serverPubKey = forge.pki.publicKeyFromPem(localStorage.getItem('serverKey'));
        const psHashCr = serverPubKey.encrypt(forge.util.encodeUtf8(psHash));
        const psHashCrB64 = forge.util.encode64(psHashCr);
        // @ts-ignore
        // tslint:disable-next-line:max-line-length
        return this.http.post<{ ticket_for_token: any }>('/api/getticketfortoken', JSON.stringify({pass: psHashCrB64}), {headers: allHeaders}).pipe(
            map(({ticket_for_token}) => {
                const ticketfortokenCrB64 = ticket_for_token;
                const ticketfortokenCr = forge.util.decode64(ticketfortokenCrB64);
                const ticketfortoken = clientPrvKey.decrypt(ticketfortokenCr);
                this.storeTicketForToken(ticketfortoken);
                return {ticket_for_token: ticketfortoken};
            }),
            catchError(selector => {
                return of(false);
            })
        );

    }

    getToken(): Observable<{ ticket_for_token: any, token: any }> {
        const ticketfortoken = localStorage.getItem('ticket_for_token');
        const allHeaders = {
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json',
            ticketfortoken
        };
        // @ts-ignore
        return this.http.post<{ ticket_for_token: any, token: any }>('/api/gettoken', null, {headers: allHeaders}).pipe(
            map(({ticket_for_token, token}) => {
                const clientPrvKeyStr = localStorage.getItem('clientPrvKeyStr');
                const clientPrvKey = forge.pki.privateKeyFromPem(clientPrvKeyStr);
                const ticketfortokenCrB64 = ticket_for_token;
                const ticketfortokenCr = forge.util.decode64(ticketfortokenCrB64);
                // tslint:disable-next-line:no-shadowed-variable
                const ticketfortoken = clientPrvKey.decrypt(ticketfortokenCr);
                this.storeTicketForToken(ticketfortoken);
                const tokenCrB64 = token;
                const tokenCr = forge.util.decode64(tokenCrB64);
                const tokenStr = clientPrvKey.decrypt(tokenCr);
                this.storeToken(tokenStr);
                this.setTokenInternal(tokenStr);
                return {ticket_for_token: ticketfortoken, token: tokenStr};
            }),
            catchError(selector => {
                return of(false);
            })
        );
    }


    private onNewPass: Observable<any>;

    public saveNewPass(oldPass, newPass): Observable<boolean> {
        const allHeaders = {
            'old_password': this.getHASH(oldPass),
            'new_password': this.getHASH(newPass),
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };
        this.onNewPass = this.http.post<{ result: any }>('/authorised/admusers/user_chenge_password', null, {headers: allHeaders}).pipe(
            map((result: any) => {
                return result;
            }),
            catchError(selector => {
                // this.setRoles([]);
                return of(false);
            })
        );
        return this.onNewPass;
    }

    getUserRoles(): Observable<boolean> {
        const allHeaders = {
            'Content-Encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.8',
            accept: 'application/json, application/json'
        };

        return new Observable<boolean>(observer => {
            this.http.post<{ result: any }>('/authorised/admusers/admuser_roleslist', null, {
                headers: allHeaders,
                observe: 'response'
            })
                // as 'body'
                .subscribe(response => {
                    this.setRoles(response.body);
                    observer.next(true);
                    observer.complete();
                }, response => {
                    if (response.status === 401) {
                        this.getToken().subscribe(result => {
                            if (result) {
                                console.log('received new token');
                                window.location.reload();
                                observer.next();
                                observer.complete();
                            } else {
                                this.router.navigate(['\login']).then(r => {});
                                observer.next();
                                observer.complete();
                            }
                        }, error => {
                            observer.next();
                            observer.complete();
                        });
                    }
                });
        });
    }
}
