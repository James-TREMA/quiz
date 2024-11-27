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
   * Récupère des questions depuis l'API ou le cache.
   * @param amount Le nombre de questions à récupérer
   * @param categoryId L'ID de la catégorie (facultatif)
   * @returns Un Observable contenant les questions
   */
  getQuestions(amount: number, categoryId?: number): Observable<any> {
    // Si le cache correspond à la catégorie demandée, on retourne le cache
    if (this.cachedQuestions.length > 0 && this.cachedCategoryId === categoryId) {
      return of({ results: this.cachedQuestions });
    }

    // Construction des paramètres de requête
    const params = new URLSearchParams({ amount: `${amount}` });
    if (categoryId) params.append('category', `${categoryId}`);

    const url = `${this.apiUrl}?${params.toString()}`;
    
    // Appel HTTP pour récupérer les questions
    return this.http.get<any>(url).pipe(
      tap((response) => {
        // Décodage des questions et réponses pour éviter les entités HTML
        response.results = response.results.map((q: any) => ({
          ...q,
          question: decode(q.question),
          correct_answer: decode(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map((ans: string) => decode(ans)),
        }));
        // Mise en cache des questions
        this.cachedQuestions = response.results;
        this.cachedCategoryId = categoryId;
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des questions', error);
        return throwError(() => new Error('Erreur de chargement des questions'));
      })
    );
  }

  /**
   * Retourne les questions en cache.
   * @returns Les questions en cache
   */
  getCachedQuestions(): any[] {
    return this.cachedQuestions;
  }

  /**
   * Vide le cache des questions.
   */
  clearCache(): void {
    this.cachedQuestions = [];
    this.cachedCategoryId = null;
  }

  /**
   * Récupère les scores depuis le stockage local.
   * @returns Les scores (total, corrects, incorrects)
   */
  getScores(): { totalAnswers: number; correctAnswers: number; incorrectAnswers: number } {
    const scores = localStorage.getItem(this.scoresKey);
    if (scores) {
      return JSON.parse(scores);
    }
    return { totalAnswers: 0, correctAnswers: 0, incorrectAnswers: 0 };
  }

  /**
   * Met à jour les scores dans le stockage local.
   * @param totalAnswers Nombre total de réponses
   * @param correctAnswers Nombre de réponses correctes
   * @param incorrectAnswers Nombre de réponses incorrectes
   */
  setScores(totalAnswers: number, correctAnswers: number, incorrectAnswers: number): void {
    const scores = { totalAnswers, correctAnswers, incorrectAnswers };
    localStorage.setItem(this.scoresKey, JSON.stringify(scores));
  }

  /**
   * Réinitialise les scores.
   */
  clearScores(): void {
    localStorage.removeItem(this.scoresKey);
  }

  /**
   * Incrémente les scores en fonction de la validité de la réponse.
   * @param isCorrect Indique si la réponse est correcte
   */
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