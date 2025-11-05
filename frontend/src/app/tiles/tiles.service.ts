import { inject, Injectable, signal } from '@angular/core';
import { Tile } from './tile.model';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '../error.service';
import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TilesService {
  private tiles = signal<Tile[]>([]);

  private http = inject(HttpClient);
  // TODO: Uncomment when ErrorService is implemented
  // private errorService = inject(ErrorService);

  readonly loadedTiles = this.tiles.asReadonly();

  // methods
  loadTiles() {
    return this.http.get<{ tiles: Tile[] }>('http://localhost:3000/tiles').pipe(
      map((res) => res.tiles),
      tap((tiles) => this.tiles.set(tiles)),
      catchError((err) => {
        // TODO: Uncomment when ErrorService is implemented
        // this.errorService.showError('Nepodařilo se načíst tiles.');
        return throwError(() => new Error('Chyba při načítání tiles'));
      })
    );
  }

  addTile(tile: Tile) {
    const currentTiles = this.tiles();

    return this.http
      .put<{ tiles: Tile[] }>('http://localhost:3000/tiles', {
        tile,
      })
      .pipe(
        tap((res) => {
          this.tiles.set(res.tiles);
        }),
        catchError((err) => {
          if (err.status === 409) {
            // Tile už existuje
            return throwError(() => new Error('Tile already exists.'));
          }

          return throwError(() => new Error('Error adding tile.'));
        })
      );
  }

  deleteTile(tileId: string) {
    const currentTiles = this.tiles();
    const updated = currentTiles.filter((tile) => tile.id !== tileId);

    // Optimistické mazání
    this.tiles.set(updated);

    return this.http.delete<{ tiles: Tile[] }>(`http://localhost:3000/tiles/${tileId}`).pipe(
      catchError((err) => {
        this.tiles.set(currentTiles);
        // this.errorService.showError('Chyba při mazání tile.');
        return throwError(() => new Error('Chyba při mazání tile'));
      })
    );
  }
}
