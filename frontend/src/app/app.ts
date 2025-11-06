import { Component, signal } from '@angular/core';
import { TilesComponent } from './tiles/tiles.component';
import { FormComponent } from './tiles/form/form.component';

@Component({
  selector: 'app-root',
  imports: [TilesComponent, FormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  showTilesSection = signal(false);

  toggleTilesSection() {
    this.showTilesSection.update((prevState) => !prevState);
  }
}
