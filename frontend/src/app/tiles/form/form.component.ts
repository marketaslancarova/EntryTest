import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
type DisplayOption = '3 tiles' | '4 tiles' | '5 tiles';

interface Tile {
  id: string;
  text: string;
  link: string;
  bg: string;
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly displayOptions: DisplayOption[] = ['3 tiles', '4 tiles', '5 tiles'];
  closed = output<void>();

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

  // pravý panel – formulář pro nový tile
  readonly tileForm = this.fb.group({
    bg: this.fb.control('#3366ff', {
      validators: [Validators.required],
    }),
    text: this.fb.control('', {
      validators: [Validators.required],
    }),
    link: this.fb.control(''),
  });

  // existující tiles (ty "Photos / Typography / Text / Icons / Videos")
  readonly tiles = signal<readonly Tile[]>([
    {
      id: 'photos',
      text: 'Photos',
      link: 'www.brandmaster.com',
      bg: '#3366ff',
    },
    {
      id: 'typography',
      text: 'Typography',
      link: 'www.brandmaster.com',
      bg: '#3366ff',
    },
    {
      id: 'text',
      text: 'Text',
      link: 'www.brandmaster.com',
      bg: '#3366ff',
    },
    {
      id: 'icons',
      text: 'Icons',
      link: 'Enter URL',
      bg: '#3366ff',
    },
    {
      id: 'videos',
      text: 'Videos',
      link: 'Enter URL',
      bg: '#3366ff',
    },
  ]);

  onDropTile(event: CdkDragDrop<Tile[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const arr = [...this.tiles()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.tiles.set(arr); // nebo this.tiles.update(() => arr);
  }

  // submit levého panelu (nastavení)
  onUpdateSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const settings = this.settingsForm.getRawValue();
    console.log('Settings updated', settings);
    // tady by šlo volat API nebo emitnout ven přes output()
  }

  // submit pravého panelu (přidání tile)
  onSubmitTile(): void {
    if (this.tileForm.invalid) {
      return;
    }

    const { bg, text, link } = this.tileForm.getRawValue();

    this.tiles.update((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        text,
        link,
        bg,
      },
    ]);

    this.tileForm.reset({
      bg: '#3366ff',
      text: '',
      link: '',
    });
  }

  onDeleteTile(id: string): void {
    this.tiles.update((list) => list.filter((tile) => tile.id !== id));
  }

  onClose(): void {
    this.closed.emit();
  }
}
