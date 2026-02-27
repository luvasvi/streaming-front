import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
private apiUrl = 'https://streaming-back-production-c915.up.railway.app/movies';

  constructor(private http: HttpClient) {}

  // Método flexível para aceitar /search, /details ou /person
  getMovie(path: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${path}`);
  }
}