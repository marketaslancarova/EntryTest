import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Tile } from './tile.model';

@Injectable({ providedIn: 'root' })
export class TilesService {
  private tiles = signal<Tile[]>([]);
  private http = inject(HttpClient);

  readonly loadedTiles = this.tiles.asReadonly();

  // 🔹 Načtení všech tiles
  loadTiles() {
    return this.http.get<{ tiles: Tile[] }>('http://localhost:3000/tiles').pipe(
      map((res) => res.tiles),
      tap((tiles) => this.tiles.set(tiles)),
      catchError(() => throwError(() => new Error('Chyba při načítání tiles')))
    );
  }

  // 🔹 Přidání nového tile – pošleme všechny tiles
  addTile(tile: Tile) {
    const updatedTiles = [...this.tiles(), tile];
    this.tiles.set(updatedTiles);

    return this.http
      .put<{ tiles: Tile[] }>('http://localhost:3000/tiles', { tiles: updatedTiles })
      .pipe(
        tap((res) => this.tiles.set(res.tiles)),
        catchError((err) => {
          this.tiles.update((prev) => prev.filter((t) => t.id !== tile.id));
          return throwError(() => new Error(err.message ?? 'Chyba při přidávání tile'));
        })
      );
  }

  // 🔹 Mazání tile – taky pošleme všechny
  deleteTile(tileId: string) {
    const updatedTiles = this.tiles().filter((tile) => tile.id !== tileId);
    this.tiles.set(updatedTiles);

    return this.http
      .put<{ tiles: Tile[] }>('http://localhost:3000/tiles', { tiles: updatedTiles })
      .pipe(
        tap((res) => this.tiles.set(res.tiles)),
        catchError((err) => {
          return throwError(() => new Error(err.message ?? 'Chyba při mazání tile'));
        })
      );
  }

  // 🔹 Update jednoho tile (při editaci text/link)
  updateTileLocal(id: string, changes: Partial<Tile>) {
    this.tiles.update((list) =>
      list.map((tile) => (tile.id === id ? { ...tile, ...changes } : tile))
    );
  }

  // 🔹 Uložení všech tiles na backend (třeba při kliknutí na "Update" vlevo)
  updateAllTiles(tiles: Tile[]) {
    return this.http.put<{ tiles: Tile[] }>('http://localhost:3000/tiles', { tiles }).pipe(
      tap((res) => this.tiles.set(res.tiles)),
      catchError((err) => throwError(() => new Error(err.message ?? 'Chyba při ukládání tiles')))
    );
  }

  // 🔹 Drag & drop reorder – jen změní pořadí, uloží až Update
  reorderTiles(prevIndex: number, currIndex: number) {
    const arr = [...this.tiles()];
    moveItemInArray(arr, prevIndex, currIndex);
    this.tiles.set(arr);
  }
}
