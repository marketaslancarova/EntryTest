import { Component, signal } from '@angular/core';
import { TilesComponent } from './tiles/tiles.component/tiles.component';

@Component({
  selector: 'app-root',
  imports: [TilesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
