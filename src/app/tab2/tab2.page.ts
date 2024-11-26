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

    if (cachedQuestions.length > 0) {
      // Utilise les questions en cache
      this.questions = cachedQuestions;
      this.isLoading = false;
    } else {
      // Charge les questions depuis l'API et les met en cache
      this.triviaService.getQuestions(10, this.categoryId).subscribe({
        next: (data) => {
          this.questions = data.results.map((q: any) => ({
            question: q.question,
            correctAnswer: q.correct_answer,
            allAnswers: this.shuffleAnswers([q.correct_answer, ...q.incorrect_answers]),
            completed: false,
          }));
          this.triviaService.setCachedQuestions(this.questions); // Sauvegarde dans le cache
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
    return answers.sort(() => Math.random() - 0.5);
  }

  selectAnswer(question: any, selectedAnswer: string) {
    if (!question.completed) {
      question.selectedAnswer = selectedAnswer;
      if (selectedAnswer === question.correctAnswer) {
        question.completed = true;
        // alert('Bonne réponse !');
      } else {
        // alert('Mauvaise réponse.');
      }
    }
  }
}