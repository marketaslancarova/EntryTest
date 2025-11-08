import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TilesService } from './tiles.service';
import { Tile } from './tile.model';
import { TileComponent } from './tile/tile.component';
import { FormComponent } from './form/form.component';

@Component({
  selector: 'app-tiles',
  imports: [TileComponent],
  templateUrl: './tiles.component.html',
  styleUrl: './tiles.component.css',
})
export class TilesComponent implements OnInit {
  private service = inject(TilesService);
  private destroyRef = inject(DestroyRef);

  tiles = this.service.loadedTiles;
  isFetching = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.service.loadTiles().subscribe({
      error: (err) => {
        this.error.set(err.message);
        this.isFetching.set(false);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  onAddTile(tile: Tile) {
    this.service.addTile(tile).subscribe();
  }

  onDelete(tile: Tile) {
    const sub = this.service.deleteTile(tile.id).subscribe({
      error: (err) => this.error.set(err.message),
    });
    console.log(tile);

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
