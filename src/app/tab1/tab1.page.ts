import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TriviaService } from '../services/trivia.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonList, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})

export class Tab1Page implements OnInit {
  categories: any[] = [];
  isLoading = true;

  constructor(private triviaService: TriviaService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.triviaService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.trivia_categories || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories', err);
        this.isLoading = false;
      },
    });
  }
}
