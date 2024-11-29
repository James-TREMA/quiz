import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { decode } from 'html-entities';
import { TriviaService } from '../services/trivia.service';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonSpinner,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

addIcons({
  'checkmark-circle-outline': checkmarkCircleOutline,
});

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCard,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSpinner,
    IonButton,
    IonIcon,
    CommonModule,
  ],
})
export class Tab2Page implements OnInit {
  questions: {
    question: string;
    correctAnswer: string;
    allAnswers: string[];
    completed: boolean;
    selectedAnswer?: string;
  }[] = [];
  isLoading = true;
  categoryId!: number;
  currentQuestionIndex = 0;
  private isFetchingQuestions = false;
  showNextQuestionTimeout: any;

  constructor(
    private triviaService: TriviaService,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    console.log('>>> [Tab2Page] Initialisation de la page Tab2');
    this.route.queryParams.subscribe((params) => {
      console.log('>>> [Tab2Page] Paramètres de la route reçus :', params);
      if (params['categoryId']) {
        this.categoryId = +params['categoryId'];
        console.log('>>> [Tab2Page] Catégorie sélectionnée :', this.categoryId);
        this.loadQuestions();
      } else {
        console.warn('>>> [Tab2Page] Aucun ID de catégorie fourni dans les paramètres.');
      }
    });
  }

  ionViewWillEnter(): void {
    console.log('>>> [Tab2Page] Retour sur Tab2. Tentative de restauration des données.');

    try {
      this.triviaService.restoreCache();
      const cachedQuestions = this.triviaService.getCachedQuestions();
      const cachedCategoryId = this.triviaService.getCachedCategoryId();

      console.log('>>> [Tab2Page] Questions restaurées depuis le cache :', cachedQuestions);
      console.log('>>> [Tab2Page] ID de catégorie en cache :', cachedCategoryId);

      if (
        cachedQuestions.length > 0 &&
        cachedCategoryId === this.categoryId
      ) {
        console.log('>>> [Tab2Page] Les questions mises en cache correspondent à la catégorie actuelle.');
        this.questions = cachedQuestions.map((q) => ({
          ...q,
          selectedAnswer: q.selectedAnswer || null,
          completed: q.completed || false,
        }));
        console.log('>>> [Tab2Page] Questions après restauration :', this.questions);
        this.isLoading = false;
      } else {
        console.log('>>> [Tab2Page] Les questions mises en cache ne correspondent pas. Rechargement...');
        this.loadQuestions();
      }
    } catch (error) {
      console.error('>>> [Tab2Page] Erreur lors de la tentative de restauration du cache :', error);
      this.loadQuestions(); // Fallback pour éviter un blocage
    }
  }

  loadQuestions(): void {
    if (this.isFetchingQuestions) {
      console.warn('>>> [Tab2Page] Appel multiple à loadQuestions évité.');
      return;
    }

    console.log('>>> [Tab2Page] Début du chargement des questions pour la catégorie :', this.categoryId);
    this.isFetchingQuestions = true;
    this.isLoading = true;

    this.triviaService
      .getQuestionsWithDelay(10, this.categoryId)
      .then((observable) => {
        observable.subscribe({
          next: (data: { results: any[] }) => {
            console.log('>>> [Tab2Page] Données reçues de l\'API Trivia :', data);

            if (data && Array.isArray(data.results) && data.results.length > 0) {
              this.questions = data.results.map((q) => ({
                question: decode(q.question || ''),
                correctAnswer: decode(q.correct_answer || ''),
                allAnswers: this.shuffleAnswers([
                  decode(q.correct_answer || ''),
                  ...(q.incorrect_answers || []).map((ans: string) =>
                    decode(ans || '')
                  ),
                ]),
                completed: false,
              }));
              console.log('>>> [Tab2Page] Questions formatées avec les réponses :', this.questions);

              this.triviaService.setCachedQuestions(this.questions);
              this.triviaService.setCachedCategoryId(this.categoryId);
            } else {
              console.warn('>>> [Tab2Page] Aucune question valide reçue.');
              this.presentToast(
                'Aucune question disponible pour cette catégorie. Veuillez réessayer plus tard.'
              );
            }
            this.isLoading = false;
            this.isFetchingQuestions = false;
          },
          error: (err) => {
            console.error('>>> [Tab2Page] Erreur lors de la réception des données de l\'API :', err);
            this.isLoading = false;
            this.isFetchingQuestions = false;
            if (err.message.includes('429')) {
              this.presentToast(
                'Vous avez atteint la limite de requêtes. Veuillez patienter et réessayer.'
              );
            } else {
              this.presentToast('Une erreur est survenue. Veuillez réessayer.');
            }
          },
        });
      })
      .catch((err) => {
        console.error('>>> [Tab2Page] Erreur lors de la configuration de la requête Trivia :', err);
        this.isLoading = false;
        this.isFetchingQuestions = false;
        this.presentToast(
          'Impossible de charger les questions. Veuillez réessayer.'
        );
      });
  }

  shuffleAnswers(answers: string[]): string[] {
    console.log('>>> [Tab2Page] Mélange des réponses :', answers);
    return [...answers].sort(() => Math.random() - 0.5);
  }

  async presentToast(message: string, duration: number = 3000): Promise<void> {
    console.log('>>> [Tab2Page] Affichage d\'un toast avec le message :', message);
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
    });
    await toast.present();
  }

  selectAnswer(question: any, selectedAnswer: string): void {
    if (!question.completed) {
      question.completed = true;
      question.selectedAnswer = selectedAnswer;

      console.log('>>> [Tab2Page] Réponse sélectionnée :', selectedAnswer);
      console.log('>>> [Tab2Page] Réponse correcte :', question.correctAnswer);

      const isCorrect =
        decode(selectedAnswer).trim().toLowerCase() ===
        decode(question.correctAnswer).trim().toLowerCase();
      this.triviaService.incrementScores(isCorrect);

      console.log('>>> [Tab2Page] Mise à jour des scores après sélection :', this.triviaService.getScores());

      clearTimeout(this.showNextQuestionTimeout);
      this.showNextQuestionTimeout = setTimeout(() => {
        this.goToNextQuestion();
      }, 1500);
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      console.log('>>> [Tab2Page] Passage à la question suivante. Index actuel :', this.currentQuestionIndex);
    } else {
      console.log('>>> [Tab2Page] Quiz terminé.');
      this.presentToast('Quiz terminé');
    }
  }
}