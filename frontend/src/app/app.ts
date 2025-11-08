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
  // Jestli už proběhl první klik
  initialized = signal(false);

  // Jestli je otevřený formulář (modal)
  formOpen = signal(false);

  onGearClick() {
    // PRVNÍ klik – jen zobrazí obsah (title + subtitle + tiles),
    // formulář zatím NEotvíráme
    if (!this.initialized()) {
      this.initialized.set(true);
      return;
    }

    // Další kliky – už jen toggle formuláře
    this.formOpen.update((open) => !open);
  }

  onFormClose() {
    this.formOpen.set(false);
  }
}
