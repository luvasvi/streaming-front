import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
private apiUrl = 'http://localhost:8080/movies';

  constructor(private http: HttpClient) {}

  // Método flexível para aceitar /search, /details ou /person
  getMovie(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${path}`);
  }
}