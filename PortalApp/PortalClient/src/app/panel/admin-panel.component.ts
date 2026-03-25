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
  errorMessage: string | null = null;

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
    this.errorMessage = null;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: () => {
        this.errorMessage = 'Failed to execute: Unauthorized access or server error.';
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
    this.errorMessage = null;
    
    this.adminService.getUserNotes(user.id).subscribe({
      next: (notes) => {
        this.selectedUser.notes = notes;
      },
      error: (err) => {
        this.errorMessage = 'Failed to execute: Could not fetch user notes.';
      }
    });
  }

  addUser() {
    this.errorMessage = null;
    if (this.newUser.login.trim() && this.newUser.password.trim()) {
      this.adminService.addUser(this.newUser).subscribe({
        next: (res) => {
          this.loadUsers();
          this.newUser = { login: '', password: '', firstName: '', lastName: '', email: '' };
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Username already taken or invalid data.';
        }
      });
    } else {
      this.errorMessage = 'Failed to execute: Login and password are required.';
    }
  }

  deleteUser() {
    this.errorMessage = null;
    if (this.selectedUser && confirm(`Czy na pewno chcesz usunąć użytkownika ${this.selectedUser.name}?`)) {
      this.adminService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.selectedUser.id);
          this.selectedUser = null;
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Could not delete user.';
        }
      });
    }
  }

  addGroup() {
    this.errorMessage = null;
    if (this.selectedUser && this.newGroupName.trim()) {
      this.adminService.addGroup(this.selectedUser.id, this.newGroupName.trim()).subscribe({
        next: () => {
          if (!this.selectedUser.groups) this.selectedUser.groups = [];
          this.selectedUser.groups.push(this.newGroupName.trim());
          this.newGroupName = '';
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Could not add group.';
        }
      });
    }
  }

  removeGroup(group: string) {
    this.errorMessage = null;
    if (this.selectedUser) {
      this.adminService.removeGroup(this.selectedUser.id, group).subscribe({
        next: () => {
          this.selectedUser.groups = this.selectedUser.groups.filter((g: string) => g !== group);
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Could not remove group.';
        }
      });
    }
  }

  removeNote(noteId: number) {
    this.errorMessage = null;
    if (this.selectedUser && confirm('Na pewno chcesz usunąć tę notatkę?')) {
      this.adminService.deleteNoteAdmin(noteId).subscribe({
        next: () => {
          this.selectedUser.notes = this.selectedUser.notes.filter((n: any) => n.id !== noteId);
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute: Could not delete note.';
        }
      });
    }
  }
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}