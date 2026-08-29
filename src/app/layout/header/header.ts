import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStatus } from '../../core/auth/components/auth-status/auth-status';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AuthStatus],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}