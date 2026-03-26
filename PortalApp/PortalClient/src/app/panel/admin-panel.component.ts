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
  isAddUserExpanded: boolean = false; 

  // Variable to store the note currently being previewed
  selectedNotePreview: any | null = null;

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
        alert('Access denied or server error.');
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
    this.selectedNotePreview = null; // Close preview when changing user
    
    this.adminService.getUserNotes(user.id).subscribe({
      next: (notes) => {
        this.selectedUser.notes = notes;
      },
      error: (err) => console.error("Failed to fetch notes", err)
    });
  }

  addUser() {
    if (this.newUser.login.trim() && this.newUser.password.trim()) {
      this.adminService.addUser(this.newUser).subscribe({
        next: (res) => {
          alert('User added successfully!');
          this.loadUsers(); // Reload list
          // Clear form
          this.newUser = { login: '', password: '', firstName: '', lastName: '', email: '' };
        },
        error: (err) => {
          alert('Error while adding user. Check if login is already taken.');
        }
      });
    } else {
      alert('Login and password are required!');
    }
  }

  deleteUser() {
    if (this.selectedUser && confirm(`Are you sure you want to delete user ${this.selectedUser.name}?`)) {
      this.adminService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.selectedUser.id);
          this.selectedUser = null;
        },
        error: (err) => alert('Error while deleting user.')
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
        error: (err) => alert('Error while adding group.')
      });
    }
  }

  removeGroup(group: string) {
    if (this.selectedUser) {
      this.adminService.removeGroup(this.selectedUser.id, group).subscribe({
        next: () => {
          this.selectedUser.groups = this.selectedUser.groups.filter((g: string) => g !== group);
        },
        error: (err) => alert('Error while removing group.')
      });
    }
  }

  // Open note preview
  viewNoteDetails(note: any) {
    this.selectedNotePreview = note;
  }

  // Close note preview
  closeNotePreview() {
    this.selectedNotePreview = null;
  }

  removeNote(noteId: number, event: Event) {
    event.stopPropagation(); // Prevents the preview modal from opening when clicking the "X" button
    if (this.selectedUser && confirm('Are you sure you want to delete this note?')) {
      this.adminService.deleteNoteAdmin(noteId).subscribe({
        next: () => {
          this.selectedUser.notes = this.selectedUser.notes.filter((n: any) => n.id !== noteId);
          // If the deleted note was currently being previewed, close the preview
          if (this.selectedNotePreview?.id === noteId) {
            this.closeNotePreview();
          }
        },
        error: (err) => alert('Error while deleting note.')
      });
    }
  }
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}