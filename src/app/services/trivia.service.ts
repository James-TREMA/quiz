import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { decode } from 'html-entities';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class TriviaService {
  private readonly apiUrl = 'https://opentdb.com/api.php';
  private cachedQuestions: any[] = [];
  private cachedCategoryId: number | null | undefined = null;
  private readonly scoresKey = 'triviaScores';

  constructor(private http: HttpClient, private toastController: ToastController) {}

  // Fonction pour afficher une notification
  async presentToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top', // Pour afficher en bas on utilise bottom mais on l'affiche en haut donc top
    });
    await toast.present();
  }

  getCategories(): Observable<{ trivia_categories: { id: number; name: string }[] }> {
    const url = 'https://opentdb.com/api_category.php';
    return this.http.get<{ trivia_categories: { id: number; name: string }[] }>(url).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des catégories', error);
        return throwError(() => new Error('Erreur de chargement des catégories'));
      })
    );
  }

  getQuestions(amount: number, categoryId?: number): Observable<any> {
    if (this.cachedQuestions.length > 0 && this.cachedCategoryId === categoryId) {
      console.log('Utilisation des questions en cache.');
      return of({ results: this.cachedQuestions });
    }
  
    const params = new URLSearchParams({ amount: `${amount}` });
    if (categoryId) params.append('category', `${categoryId}`);
  
    const url = `${this.apiUrl}?${params.toString()}`;
  
    return this.http.get<any>(url).pipe(
      tap((response) => {
        if (response && Array.isArray(response.results)) {
          response.results = response.results.map((q: any) => ({
            ...q,
            question: decode(q.question),
            correct_answer: decode(q.correct_answer),
            incorrect_answers: q.incorrect_answers.map((ans: string) => decode(ans)),
          }));
          this.cachedQuestions = response.results;
          this.cachedCategoryId = categoryId;
        } else {
          console.error('Les résultats retournés par l\'API ne sont pas valides.', response);
          throw new Error('Résultats invalides retournés par l\'API.');
        }
      }),
      catchError((error) => {
        if (error.status === 429) {
          console.error('Limite de requêtes atteinte. Réessayez plus tard.');
          this.presentToast('Limite de requêtes atteinte. Réessayez plus tard.');
        } else {
          console.error('Erreur lors de la récupération des questions', error);
        }
        return throwError(() => new Error('Erreur de chargement des questions'));
      })
    );
  }
    
  async getQuestionsWithDelay(amount: number, categoryId?: number): Promise<Observable<any>> {
    await this.delay(1000); // Pause de 1 seconde entre les appels
    return this.getQuestions(amount, categoryId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    console.log('Cache des questions vidé');
  }

  getScores(): { totalAnswers: number; correctAnswers: number; incorrectAnswers: number } {
    const scores = localStorage.getItem(this.scoresKey);
    console.log('Scores récupérés depuis localStorage :', scores);
    if (scores) {
      return JSON.parse(scores);
    }
    return { totalAnswers: 0, correctAnswers: 0, incorrectAnswers: 0 };
  }

  setScores(totalAnswers: number, correctAnswers: number, incorrectAnswers: number): void {
    const scores = { totalAnswers, correctAnswers, incorrectAnswers };
    console.log('Enregistrement des scores dans localStorage :', scores);
    localStorage.setItem(this.scoresKey, JSON.stringify(scores));
  }

  clearScores(): void {
    localStorage.removeItem(this.scoresKey);
  }

  incrementScores(isCorrect: boolean): void {
    const scores = this.getScores();
    console.log('Scores avant mise à jour :', scores);

    scores.totalAnswers++;
    if (isCorrect) {
      scores.correctAnswers++;
      console.log('Bonne réponse ajoutée.');
    } else {
      scores.incorrectAnswers++;
      console.log('Mauvaise réponse ajoutée.');
    }
    this.setScores(scores.totalAnswers, scores.correctAnswers, scores.incorrectAnswers);

    console.log('Scores après mise à jour :', scores);
  }
}