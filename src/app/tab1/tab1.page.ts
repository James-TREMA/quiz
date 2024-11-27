import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TriviaService } from '../services/trivia.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { pricetagOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

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
  categories: { id: number; name: string }[] = []; // Typage explicite des catégories
  isLoading = true;

  constructor(private triviaService: TriviaService, private router: Router) {}

  ngOnInit() {
    this.loadCategories(); // Chargement des catégories au démarrage
  }

  /**
   * Charge les catégories de questions depuis le service
   */
  loadCategories(): void {
    this.triviaService.getCategories().subscribe({
      next: (data: { trivia_categories: { id: number; name: string }[] }) => {
        this.categories = data.trivia_categories || []; // Stocke les catégories ou une liste vide
        this.isLoading = false; // Arrête le spinner de chargement
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des catégories', err);
        this.isLoading = false; // Arrête le spinner même en cas d'erreur
      },
    });
  }

  /**
   * Navigue vers les questions d'une catégorie spécifique
   * @param categoryId ID de la catégorie sélectionnée
   */
  goToQuestions(categoryId: number): void {
    this.router.navigate(['/tabs/tab2'], { queryParams: { categoryId } });
  }
}