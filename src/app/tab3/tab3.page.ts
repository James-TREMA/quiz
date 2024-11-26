import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCardContent,
  IonCard,
  IonButton,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { TriviaService } from '../services/trivia.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
  ],
})
export class Tab3Page implements OnInit {
  profileImage: string = '';
  totalAnswers: number = 0;
  correctAnswers: number = 0;
  incorrectAnswers: number = 0;

  constructor(private triviaService: TriviaService) {}

  ngOnInit() {
    this.updateScores();
  }

  updateScores() {
    const scores = this.triviaService.getScores();
    this.totalAnswers = scores.totalAnswers;
    this.correctAnswers = scores.correctAnswers;
    this.incorrectAnswers = scores.incorrectAnswers;
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetScores() {
    this.triviaService.clearScores();
    this.totalAnswers = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
  }
}