import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BooksStore } from '../../state/books.store';
import { BookForm } from '../../components/book-form/book-form';
import { BookFormValue } from '../../models';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-create-book-page',
  imports: [BookForm, RouterLink],
  templateUrl: './create-book-page.html',
  styleUrl: './create-book-page.scss',
})
export class CreateBookPage {
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  protected readonly store = inject(BooksStore);

  async onSave(value: BookFormValue): Promise<void> {
    const book = await this.store.create({
      title: value.title,
      author: value.author,
      description: value.description,
      isbn: value.isbn,
      publisher: value.publisher,
      publishedYear: value.publishedYear,
      genre: value.genre,
      pageCount: value.pageCount,
    });
    if (book) {
      this.notifications.success('Book created successfully.');
      void this.router.navigate(['/books', book.id]);
    }
  }
}