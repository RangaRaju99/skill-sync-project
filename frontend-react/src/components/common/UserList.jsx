import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAsync } from '../../hooks/useAsync';
import './UserList.scss';

/**
 * USER LIST COMPONENT WITH *ngFor CONVERSION
 *
 * Angular Version (*ngFor):
 * =========================
 * <div *ngIf="users$ | async as users; else loading">
 *   <div *ngIf="users.length > 0; else noUsers">
 *     <div *ngFor="let user of users" class="user-card">
 *       {{user.name}} - {{user.email}}
 *     </div>
 *   </div>
 *   <ng-template #noUsers>
 *     <p>No users found</p>
 *   </ng-template>
 * </div>
 * <ng-template #loading>
 *   <p>Loading...</p>
 * </ng-template>
 *
 * React Version (map + conditional rendering):
 * ============================================
 * Uses:
 * - useAsync custom hook (replaces async pipe)
 * - Array.map() (replaces *ngFor)
 * - Conditional rendering (replaces *ngIf)
 */
function UserList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // useAsync replaces the async pipe and observable handling
  const {
    data: users,
    isLoading: loading,
    error,
  } = useAsync(() => userService.getProfile('currentUser'), true);

  // Filter users based on search term
  useEffect(() => {
    if (users && Array.isArray(users)) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Loading state - replaces ng-template #loading
  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="user-list-container">
        <div className="error-message">Error loading users: {error}</div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Users</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conditional rendering: no users found - replaces *ngIf="users.length === 0" */}
      {filteredUsers.length === 0 ? (
        <div className="no-users-message">
          <p>
            {users && users.length === 0 ? 'No users found' : `No results match "${searchTerm}"`}
          </p>
        </div>
      ) : (
        // Array mapping: replaces *ngFor="let user of users"
        <div className="user-list">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * UserCard Sub-component
 * Represents individual list item
 */
function UserCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-avatar">
        <img src={user.avatarUrl || '/default-avatar.png'} alt={user.name} />
      </div>
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        {user.title && <span className="user-title">{user.title}</span>}
      </div>
      <div className="user-actions">
        <button className="btn-small">View Profile</button>
        <button className="btn-small">Message</button>
      </div>
    </div>
  );
}

export default UserList;
