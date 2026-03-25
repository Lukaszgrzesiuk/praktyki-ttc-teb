import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];
  selectedUser: any | null = null;
  searchQuery: string = '';
  newGroupName: string = '';

  
  newUser = {
    login: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  };

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: () => {
        alert('Brak uprawnień lub błąd serwera.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    return this.users.filter(u => u.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.newGroupName = '';
    
    
    this.adminService.getUserNotes(user.id).subscribe({
      next: (notes) => {
        this.selectedUser.notes = notes;
      },
      error: (err) => console.error("Nie udało się pobrać notatek", err)
    });
  }

  
  addUser() {
    if (this.newUser.login.trim() && this.newUser.password.trim()) {
      this.adminService.addUser(this.newUser).subscribe({
        next: (res) => {
          alert('Użytkownik dodany pomyślnie!');
          this.loadUsers(); // Przeładowanie listy
          // Czyszczenie formularza
          this.newUser = { login: '', password: '', firstName: '', lastName: '', email: '' };
        },
        error: (err) => {
          alert('Błąd podczas dodawania. Sprawdź czy login nie jest zajęty.');
        }
      });
    } else {
      alert('Login i hasło są wymagane!');
    }
  }

  deleteUser() {
    if (this.selectedUser && confirm(`Czy na pewno chcesz usunąć użytkownika ${this.selectedUser.name}?`)) {
      this.adminService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.selectedUser.id);
          this.selectedUser = null;
        },
        error: (err) => alert('Błąd podczas usuwania użytkownika.')
      });
    }
  }

  addGroup() {
    if (this.selectedUser && this.newGroupName.trim()) {
      this.adminService.addGroup(this.selectedUser.id, this.newGroupName.trim()).subscribe({
        next: () => {
          if (!this.selectedUser.groups) this.selectedUser.groups = [];
          this.selectedUser.groups.push(this.newGroupName.trim());
          this.newGroupName = '';
        },
        error: (err) => alert('Błąd podczas dodawania grupy.')
      });
    }
  }

  removeGroup(group: string) {
    if (this.selectedUser) {
      this.adminService.removeGroup(this.selectedUser.id, group).subscribe({
        next: () => {
          this.selectedUser.groups = this.selectedUser.groups.filter((g: string) => g !== group);
        },
        error: (err) => alert('Błąd podczas usuwania grupy.')
      });
    }
  }

  
  removeNote(noteId: number) {
    if (this.selectedUser && confirm('Na pewno chcesz usunąć tę notatkę?')) {
      this.adminService.deleteNoteAdmin(noteId).subscribe({
        next: () => {
          this.selectedUser.notes = this.selectedUser.notes.filter((n: any) => n.id !== noteId);
        },
        error: (err) => alert('Błąd podczas usuwania notatki.')
      });
    }
  }
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}