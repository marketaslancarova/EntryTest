import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { TilesService } from '../tiles.service';
import { Tile } from '../tile.model';

type DisplayOption = '3 tiles' | '4 tiles' | '5 tiles';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TilesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayOptions: DisplayOption[] = ['3 tiles', '4 tiles', '5 tiles'];
  closed = output<void>();

  // data ze servisu – readonly signal
  readonly tiles = this.service.loadedTiles;

  isFetching = signal(false);
  error = signal('');

  // levý panel – nastavení
  readonly settingsForm = this.fb.group({
    display: this.fb.control<DisplayOption>(this.displayOptions[0]),
    title: this.fb.control('Value', { validators: [Validators.required] }),
    subtitle: this.fb.control('Value'),
    loadAll: this.fb.control(true),
    tilesVisible: this.fb.control(20, {
      validators: [Validators.min(1)],
    }),
  });

  readonly textFields = [
    { label: 'Title', controlName: 'title' as const },
    { label: 'Subtitle', controlName: 'subtitle' as const },
  ];

  // pravý panel – formulář pro nový tile (pro tlačítko Add)
  readonly tileForm = this.fb.group({
    bg: this.fb.control('#3366ff'),
    text: this.fb.control(''),
    link: this.fb.control(''),
  });

  ngOnInit(): void {
    this.isFetching.set(true);

    const sub = this.service.loadTiles().subscribe({
      error: (err) => {
        this.error.set(err.message ?? 'Chyba při načítání tiles');
        this.isFetching.set(false);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // levý submit (settings) – uloží celé tiles na backend
  onUpdateSettings(): void {
    if (this.settingsForm.invalid) return;

    const tilesToSave = this.tiles();

    const sub = this.service.updateAllTiles(tilesToSave).subscribe({
      next: () => {
        console.log('Settings updated', this.settingsForm.getRawValue());
      },
      error: (err) => {
        this.error.set(err.message ?? 'Chyba při ukládání tiles');
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // pravý submit – klik na Add
  onSubmitTile(): void {
    const { bg, text, link } = this.tileForm.getRawValue();

    const newTile: Tile = {
      id: Date.now().toString(), // provizorní id
      bg: bg || '#3366ff',
      text: text ?? '',
      link: link ?? '',
    };

    const sub = this.service.addTile(newTile).subscribe({
      next: () => {
        this.tileForm.reset({
          bg: '#3366ff',
          text: '',
          link: '',
        });
      },
      error: (err) => {
        this.error.set(err.message ?? 'Chyba při přidávání tile');
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  // drag & drop – změna pořadí (uloží se až na Update)
  onDropTile(event: CdkDragDrop<readonly Tile[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.service.reorderTiles(event.previousIndex, event.currentIndex);
  }

  // změna hodnoty v jednom řádku (TEXT nebo LINK)
  onTileChange(id: string, field: 'text' | 'link', value: string): void {
    this.service.updateTileLocal(id, { [field]: value } as Partial<Tile>);
  }

  // mazání řádku
  onDeleteTile(id: string): void {
    const sub = this.service.deleteTile(id).subscribe({
      error: (err) => {
        this.error.set(err.message ?? 'Chyba při mazání tile');
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  onClose(): void {
    this.closed.emit();
  }
}
