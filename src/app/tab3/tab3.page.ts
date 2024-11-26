import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardHeader, IonCardContent, IonCard, IonButton, IonCardTitle } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import { TriviaService } from '../services/trivia.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonButton, IonCard, IonCardContent, IonCardHeader, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, CommonModule],
})

export class Tab3Page implements OnInit {
  profileImage: string = ''; // URL de l'image de profil
  totalAnswers: number = 0; // Total de réponses
  correctAnswers: number = 0; // Réponses correctes
  incorrectAnswers: number = 0; // Réponses incorrectes

  constructor(private triviaService: TriviaService) {}

  ngOnInit() {
    // Récupérer les scores depuis TriviaService
    const scores = this.triviaService.getScores();
    this.totalAnswers = scores.totalAnswers;
    this.correctAnswers = scores.correctAnswers;
    this.incorrectAnswers = scores.incorrectAnswers;
  }

  // Méthode pour charger une image de profil
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

  // Méthode pour réinitialiser les scores
  resetScores() {
    this.triviaService.clearScores();
    this.totalAnswers = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
  }
}