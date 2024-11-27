import { Component, OnInit } from '@angular/core';
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
  questions: any[] = [];
  isLoading = true;
  categoryId!: number;

  constructor(private triviaService: TriviaService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) {
        this.categoryId = +params['categoryId'];
        this.loadQuestions();
      }
    });
  }

  loadQuestions() {
    const cachedQuestions = this.triviaService.getCachedQuestions();

    if (cachedQuestions.length > 0 && this.triviaService.getCachedCategoryId() === this.categoryId) {
      this.questions = cachedQuestions;
      this.isLoading = false;
    } else {
      this.triviaService.getQuestions(10, this.categoryId).subscribe({
        next: (data) => {
          this.questions = data.results.map((q: any) => ({
            question: decode(q.question),
            correctAnswer: decode(q.correct_answer),
            allAnswers: this.shuffleAnswers([
              decode(q.correct_answer),
              ...q.incorrect_answers.map((ans: string) => decode(ans))
            ]),
            completed: false,
          }));
          this.triviaService.setCachedQuestions(this.questions);
          this.triviaService.setCachedCategoryId(this.categoryId);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des questions', err);
          this.isLoading = false;
        },
      });
    }
  }

  shuffleAnswers(answers: string[]): string[] {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }    

  selectAnswer(question: any, selectedAnswer: string) {
    if (!question.completed) {
      question.completed = true; // Marquer la question comme complétée
      question.selectedAnswer = selectedAnswer;

      if (selectedAnswer === question.correctAnswer) {
        this.triviaService.incrementScores(true); // Bonne réponse
      } else {
        this.triviaService.incrementScores(false); // Mauvaise réponse
      }
    }
  }
}

function decode(correct_answer: any): string {
  throw new Error('Function not implemented.');
}
