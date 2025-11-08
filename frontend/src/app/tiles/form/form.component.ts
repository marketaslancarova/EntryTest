import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tile } from '../tile.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent {
  addTile = output<Tile>();
  close = output<void>();

  form = new FormGroup({
    text: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    bg: new FormControl('#3366ff', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    link: new FormControl('', {
      nonNullable: true,
    }),
  });

  onSubmit() {
    if (this.form.invalid) return;

    const { text, bg, link } = this.form.value;

    this.addTile.emit({
      id: crypto.randomUUID(),
      text: text ?? '',
      bg: bg ?? '#3366ff',
      link: link ?? '',
    });

    this.form.reset({ bg: '#3366ff' });
  }

  onClose() {
    this.close.emit();
  }
}
