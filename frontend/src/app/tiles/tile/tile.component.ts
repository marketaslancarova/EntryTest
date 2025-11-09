import { Component, input } from '@angular/core';
import { Tile } from '../tile.model';

@Component({
  selector: 'app-tile',
  imports: [],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.css',
})
export class TileComponent {
  tile = input.required<Tile>();
}
