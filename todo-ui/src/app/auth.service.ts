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

    logout() {
        return this.http.post('/api/logout', {});
    }

    getUser() {
        return this.http.get('/api/user');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
    }

    removeToken() {
        localStorage.removeItem('token');
    }

    isLoggedIn() {
        return !!this.getToken();
    }
}
