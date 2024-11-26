import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TriviaService {
  private apiUrl = 'https://opentdb.com/api.php';
  private cachedQuestions: any[] = [];

  constructor(private http: HttpClient) {}

  // Récupérer les catégories disponibles
  getCategories(): Observable<any> {
    const url = 'https://opentdb.com/api_category.php';
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des catégories', error);
        return throwError(() => new Error('Erreur de chargement des catégories'));
      })
    );
  }

  // Récupérer des questions selon les paramètres
  getQuestions(amount: number, category?: number, difficulty?: string): Observable<any> {
    let params = `amount=${amount}`;
    if (category) params += `&category=${category}`;
    if (difficulty) params += `&difficulty=${difficulty}`;

    return this.http.get(`${this.apiUrl}?${params}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des questions', error);
        return throwError(() => new Error('Erreur de chargement des questions'));
      })
    );
  }

  // Méthode pour récupérer les questions
  getCachedQuestions(): any[] {
    return this.cachedQuestions;
  }

  // Méthode pour stocker les questions dans le cache
  setCachedQuestions(questions: any[]): void {
    this.cachedQuestions = questions;
  }

  clearCachedQuestions(): void {
    this.cachedQuestions = [];
  }
}