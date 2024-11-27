import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { decode } from 'html-entities';

@Injectable({
  providedIn: 'root',
})
export class TriviaService {
  private readonly apiUrl = 'https://opentdb.com/api.php'; // URL de l'API
  private cachedQuestions: any[] = []; // Cache des questions
  private cachedCategoryId: number | null | undefined = null; // Cache de la catégorie actuelle
  private readonly scoresKey = 'triviaScores'; // Clé pour le stockage local des scores

  constructor(private http: HttpClient) {}

  /**
   * Récupère les catégories de l'API
   * @returns Observable avec les catégories
   */
  getCategories(): Observable<{ trivia_categories: { id: number; name: string }[] }> {
    const url = 'https://opentdb.com/api_category.php';
    return this.http.get<{ trivia_categories: { id: number; name: string }[] }>(url).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des catégories', error);
        return throwError(() => new Error('Erreur de chargement des catégories'));
      })
    );
  }

  /**
   * Récupère des questions depuis l'API ou le cache
   * @param amount Nombre de questions à récupérer
   * @param categoryId ID de la catégorie
   * @returns Observable avec les questions
   */
  getQuestions(amount: number, categoryId?: number): Observable<any> {
    if (this.cachedQuestions.length > 0 && this.cachedCategoryId === categoryId) {
      return of({ results: this.cachedQuestions });
    }

    const params = new URLSearchParams({ amount: `${amount}` });
    if (categoryId) params.append('category', `${categoryId}`);

    const url = `${this.apiUrl}?${params.toString()}`;

    return this.http.get<any>(url).pipe(
      tap((response) => {
        response.results = response.results.map((q: any) => ({
          ...q,
          question: decode(q.question),
          correct_answer: decode(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map((ans: string) => decode(ans)),
        }));
        this.cachedQuestions = response.results;
        this.cachedCategoryId = categoryId;
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des questions', error);
        return throwError(() => new Error('Erreur de chargement des questions'));
      })
    );
  }

  getCachedQuestions(): any[] {
    return this.cachedQuestions;
  }

  setCachedQuestions(questions: any[]): void {
    this.cachedQuestions = questions;
  }

  getCachedCategoryId(): number | null | undefined {
    return this.cachedCategoryId;
  }

  setCachedCategoryId(categoryId: number): void {
    this.cachedCategoryId = categoryId;
  }

  clearCache(): void {
    this.cachedQuestions = [];
    this.cachedCategoryId = null;
  }

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
    scores.totalAnswers++;
    if (isCorrect) {
      scores.correctAnswers++;
    } else {
      scores.incorrectAnswers++;
    }
    this.setScores(scores.totalAnswers, scores.correctAnswers, scores.incorrectAnswers);
  }
}