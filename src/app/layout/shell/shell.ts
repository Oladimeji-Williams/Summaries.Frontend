import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Navigation } from '../navigation/navigation';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Navigation, Footer],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}