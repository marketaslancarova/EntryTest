import { Component, input, output } from '@angular/core';
import { Tile } from '../tile.model';

@Component({
  selector: 'app-tile',
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
})
export class TileComponent {
  tile = input.required<Tile>();

  delete = output<void>();

  onDeleteClick() {
    this.delete.emit();
  }
}
