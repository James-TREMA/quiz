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
  showNextQuestionTimeout: any;

  constructor(
    private triviaService: TriviaService,
    private route: ActivatedRoute,
    private toastController: ToastController // Injection correcte ici
  ) {}

  ngOnInit(): void {
    console.log('Initialisation de la page Tab2');
    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) {
        this.categoryId = +params['categoryId'];
        this.loadQuestions();
      }
    });
  }

  shuffleAnswers(answers: string[]): string[] {
    return answers.sort(() => Math.random() - 0.5);
  }

  // Fonction pour afficher une notification
  async presentToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top', // Pour afficher en bas on utilise bottom mais on l'affiche en haut donc top
    });
    await toast.present();
  }

  ionViewWillEnter(): void {
    console.log('Retour sur Tab2. Rechargement des données.');
    
    this.triviaService.restoreCache();
    
    const cachedQuestions = this.triviaService.getCachedQuestions();
    if (
      cachedQuestions.length > 0 &&
      this.triviaService.getCachedCategoryId() === this.categoryId
    ) {
      // Compléter les réponses manquantes
      this.questions = cachedQuestions.map((q) => ({
        ...q,
        allAnswers: q.allAnswers?.length ? q.allAnswers : this.shuffleAnswers([
          q.correctAnswer,
          ...(q.incorrect_answers || []),
        ]),
      }));
      console.log('Questions restaurées avec allAnswers régénérées :', this.questions);
      this.isLoading = false;
    } else {
      this.loadQuestions();
    }
  }
  
  
  loadQuestions(): void {
    this.isLoading = true;
  
    this.triviaService
      .getQuestionsWithDelay(10, this.categoryId)
      .then((observable) => {
        observable.subscribe({
          next: (data: { results: any[] }) => {
            console.log('Données reçues de l\'API :', data);
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
              console.log('Questions générées avec allAnswers :', this.questions);
              this.triviaService.setCachedQuestions(this.questions);
              this.triviaService.setCachedCategoryId(this.categoryId);
            } else {
              console.warn('Aucune question valide retournée par l\'API.');
              this.presentToast(
                'Aucune question disponible pour cette catégorie. Veuillez réessayer plus tard.'
              );
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des questions :', err);
            this.isLoading = false;
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
        console.error('Erreur lors de la configuration de la requête :', err);
        this.isLoading = false;
        this.presentToast(
          'Impossible de charger les questions. Veuillez réessayer.'
        );
      });
  }
  
  selectAnswer(question: any, selectedAnswer: string): void {
    if (!question.completed) {
      question.completed = true;
      question.selectedAnswer = selectedAnswer;

      console.log('Réponse sélectionnée :', selectedAnswer);
      console.log('Réponse correcte :', question.correctAnswer);

      const isCorrect =
        decode(selectedAnswer).trim().toLowerCase() ===
        decode(question.correctAnswer).trim().toLowerCase();
      this.triviaService.incrementScores(isCorrect);

      console.log('Mise à jour des scores effectuée :', this.triviaService.getScores());

      clearTimeout(this.showNextQuestionTimeout);
      this.showNextQuestionTimeout = setTimeout(() => {
        this.goToNextQuestion();
      }, 1500);
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      console.log('Quiz terminé');
      this.presentToast(
        'Quiz terminé'
      );
    }
  }
}