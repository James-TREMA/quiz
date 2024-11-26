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
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { ExploreContainerComponent } from "../explore-container/explore-container.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonSpinner, ExploreContainerComponent, CommonModule],
})
export class Tab2Page implements OnInit {
  questions: any[] = [];
  isLoading = true;
  categoryId!: number; // ID de la catégorie sélectionnée

  constructor(private triviaService: TriviaService, private route: ActivatedRoute) {}

  ngOnInit() {
    // Récupération de l'ID de la catégorie depuis la route
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
        this.questions = data.results || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des questions', err);
        this.isLoading = false;
      },
    });
  }
}