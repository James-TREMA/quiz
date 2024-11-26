import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TriviaService } from '../services/trivia.service';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { pricetagOutline } from 'ionicons/icons';

addIcons({
  'pricetag-outline': pricetagOutline,
});

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonIcon, IonSpinner, IonItem, IonList, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, CommonModule],
})

export class Tab1Page implements OnInit {
  categories: any[] = [];
  isLoading = true;

  constructor(private triviaService: TriviaService) {
      addIcons({pricetagOutline});}

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
