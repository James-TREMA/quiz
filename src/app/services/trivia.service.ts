import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TriviaService {
  private apiUrl = 'https://opentdb.com/api.php';
  private cachedQuestions: any[] = [];
  private cachedCategoryId: number | null = null;
  private scoresKey = 'triviaScores'; // Clé pour le stockage local des scores

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
      tap((response) => console.log('Données API reçues :', response)),
      catchError((error) => {
        console.error('Erreur lors de la récupération des questions', error);
        return throwError(() => new Error('Erreur de chargement des questions'));
      })
    );
  }

  // Gérer le cache des questions
  getCachedQuestions(): any[] {
    return this.cachedQuestions;
  }

  setCachedQuestions(questions: any[]): void {
    this.cachedQuestions = questions;
  }

  clearCachedQuestions(): void {
    this.cachedQuestions = [];
  }

  getCachedCategoryId(): number | null {
    return this.cachedCategoryId;
  }

  setCachedCategoryId(categoryId: number): void {
    this.cachedCategoryId = categoryId;
  }

  // Gestion des scores
  getScores(): { totalAnswers: number; correctAnswers: number; incorrectAnswers: number } {
    const scores = localStorage.getItem(this.scoresKey);
    if (scores) {
      return JSON.parse(scores);
    }
    return { totalAnswers: 0, correctAnswers: 0, incorrectAnswers: 0 };
  }

  setScores(totalAnswers: number, correctAnswers: number, incorrectAnswers: number): void {
    const scores = { totalAnswers, correctAnswers, incorrectAnswers };
    localStorage.setItem(this.scoresKey, JSON.stringify(scores));
  }

  clearScores(): void {
    localStorage.removeItem(this.scoresKey);
  }

  incrementScores(isCorrect: boolean): void {
    const scores = this.getScores();
    scores.totalAnswers += 1;
    if (isCorrect) {
      scores.correctAnswers += 1;
    } else {
      scores.incorrectAnswers += 1;
    }
    this.setScores(scores.totalAnswers, scores.correctAnswers, scores.incorrectAnswers);
  }  
}