import { Component, OnInit } from '@angular/core';
import { TriviaService } from '../services/trivia.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonSpinner,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    this.triviaService.getQuestions(10, this.categoryId).subscribe({
      next: (data) => {
        this.questions = data.results.map((q: any) => ({
          question: q.question,
          correctAnswer: q.correct_answer,
          allAnswers: this.shuffleAnswers([q.correct_answer, ...q.incorrect_answers]),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des questions', err);
        this.isLoading = false;
      },
    });
  }

  shuffleAnswers(answers: string[]): string[] {
    return answers.sort(() => Math.random() - 0.5);
  }

  selectAnswer(question: any, selectedAnswer: string) {
    if (selectedAnswer === question.correctAnswer) {
      alert('Bonne réponse !');
    } else {
      alert('Mauvaise réponse.');
    }
  }  
}