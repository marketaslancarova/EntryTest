import { Component, output } from '@angular/core';
import { Tile } from '../tile.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  addTile = output<Tile>();

  form = new FormGroup({
    text: new FormControl('', {
      validators: [Validators.required],
    }),
    bg: new FormControl('#3366ff', {
      validators: [Validators.required],
    }),
    link: new FormControl('', {
      validators: [],
    }),
  });

  onSubmit() {
    if (this.form.invalid) return;

    const { text, bg, link } = this.form.value;

    // Vyšleme data rodiči
    this.addTile.emit({
      text: text ?? '',
      bg: bg ?? '#3366ff',
      link: link ?? '',
      id: '',
    });

    this.form.reset({ bg: '#3366ff' });
  }
}
