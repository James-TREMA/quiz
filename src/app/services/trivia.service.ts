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
  private cachedCategoryId: number | null = null;
  private readonly scoresKey = 'triviaScores';

  constructor(private http: HttpClient, private toastController: ToastController) {}

  // Fonction pour afficher une notification
  async presentToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top', // Notification affichée en haut
    });
    await toast.present();
  }

  // Récupérer les catégories
  getCategories(): Observable<{ trivia_categories: { id: number; name: string }[] }> {
    const url = 'https://opentdb.com/api_category.php';
    return this.http.get<{ trivia_categories: { id: number; name: string }[] }>(url).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des catégories', error);
        return throwError(() => new Error('Erreur de chargement des catégories'));
      })
    );
  }

  // Récupérer des questions avec cache
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
            correctAnswer: decode(q.correct_answer),
            allAnswers: this.shuffleAnswers([
              decode(q.correct_answer),
              ...(q.incorrect_answers || []).map((ans: string) => decode(ans)),
            ]),
          }));
          this.setCachedQuestions(response.results);
  
          if (categoryId !== undefined) {
            this.setCachedCategoryId(categoryId);
          }
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
  
  // Récupérer des questions avec délai
  async getQuestionsWithDelay(amount: number, categoryId?: number): Promise<Observable<any>> {
    await this.delay(1000); // Pause de 1 seconde entre les appels
    return this.getQuestions(amount, categoryId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gestion du cache
  getCachedQuestions(): any[] {
    return this.cachedQuestions;
  }

  setCachedQuestions(questions: any[]): void {
    this.cachedQuestions = questions;
    localStorage.setItem('cachedQuestions', JSON.stringify(questions)); // Stockage local
  }

  getCachedCategoryId(): number | null {
    return this.cachedCategoryId;
  }

  setCachedCategoryId(categoryId: number): void {
    this.cachedCategoryId = categoryId;
    localStorage.setItem('cachedCategoryId', JSON.stringify(categoryId)); // Stockage local
  }

  restoreCache(): void {
    const savedQuestions = localStorage.getItem('cachedQuestions');
    const savedCategoryId = localStorage.getItem('cachedCategoryId');
    if (savedQuestions) {
      this.cachedQuestions = JSON.parse(savedQuestions);
    }
    if (savedCategoryId) {
      this.cachedCategoryId = JSON.parse(savedCategoryId);
    }
  }

  clearCache(): void {
    this.cachedQuestions = [];
    this.cachedCategoryId = null;
    localStorage.removeItem('cachedQuestions');
    localStorage.removeItem('cachedCategoryId');
    console.log('Cache des questions vidé');
  }

  // Gestion des scores
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