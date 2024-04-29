import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

    register(username: string, password: string) {
        return this.http.post('/api/register', { username, password });
    }

    login(username: string, password: string) {
        return this.http.post('/api/login', { username, password });
    }
}
