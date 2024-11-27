import { Component, OnInit } from '@angular/core';
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

  constructor(private triviaService: TriviaService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('Initialisation de la page Tab2');
    
    // Recharger les scores
    console.log('Scores actuels avant rechargement :', this.triviaService.getScores());
  
    // Recharger les questions
    const cachedQuestions = this.triviaService.getCachedQuestions();
    if (cachedQuestions.length > 0 && this.triviaService.getCachedCategoryId() === this.categoryId) {
      console.log('Questions récupérées depuis le cache.');
      this.questions = cachedQuestions;
      this.isLoading = false;
    } else {
      console.log('Cache vide ou catégorie différente. Chargement des questions depuis l\'API.');
      this.loadQuestions();
    }
  
    console.log('Scores après rechargement :', this.triviaService.getScores());
  }
  
  

  loadQuestions(): void {
    const cachedQuestions = this.triviaService.getCachedQuestions();

    if (cachedQuestions.length > 0 && this.triviaService.getCachedCategoryId() === this.categoryId) {
      this.questions = cachedQuestions;
      this.isLoading = false;
    } else {
      this.triviaService.getQuestions(10, this.categoryId).subscribe({
        next: (data: { results: any[] }) => {
          this.questions = data.results.map((q) => ({
            question: decode(q.question),
            correctAnswer: decode(q.correct_answer),
            allAnswers: this.shuffleAnswers([
              decode(q.correct_answer),
              ...q.incorrect_answers.map((ans: string) => decode(ans)),
            ]),
            completed: false,
          }));
          this.triviaService.setCachedQuestions(this.questions);
          this.triviaService.setCachedCategoryId(this.categoryId);
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement des questions', err);
          this.isLoading = false;
        },
      });
    }
  }

  selectAnswer(question: any, selectedAnswer: string): void {
    if (!question.completed) {
      question.completed = true;
      question.selectedAnswer = selectedAnswer;
  
      console.log('Réponse sélectionnée :', selectedAnswer);
      console.log('Réponse correcte :', question.correctAnswer);
  
      const isCorrect =
        decode(selectedAnswer).trim().toLowerCase() === decode(question.correctAnswer).trim().toLowerCase();
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
    }
  }

  shuffleAnswers(answers: string[]): string[] {
    return answers.sort(() => Math.random() - 0.5);
  }
}
