import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { validators, compose } from '../utils/validators';
import '../styles/Form.scss';

/**
 * Profile Page
 * Shows user profile and allows editing
 * Demonstrates: controlled components, form handling, state management
 */
function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const validationSchema = {
    firstName: validators.required,
    lastName: validators.required,
    email: compose([validators.required, validators.email]),
    bio: validators.maxLength(500),
  };

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
    async (formValues) => {
      // API call would go here
      console.log('Updating profile:', formValues);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      setIsEditMode(false);
    },
    (values) => validateProfileForm(values)
  );

  function validateProfileForm(values) {
    const fieldErrors = {};
    Object.keys(validationSchema).forEach((field) => {
      const error = validationSchema[field](values[field] || '');
      if (error) {
        fieldErrors[field] = error;
      }
    });
    return fieldErrors;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditMode && (
          <button className="btn btn-primary" onClick={() => setIsEditMode(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {!isEditMode ? (
        // View Mode
        <div className="profile-view">
          <div className="profile-card">
            <div className="profile-avatar">
              <img src={user?.avatarUrl || '/default-avatar.png'} alt={user?.name} />
            </div>

            <div className="profile-info">
              <h2>{user?.name}</h2>
              <p className="email">{user?.email}</p>
              {user?.title && <p className="title">{user?.title}</p>}

              <div className="bio-section">
                <h3>About</h3>
                <p>{user?.bio || 'No bio added yet'}</p>
              </div>

              <div className="stats-section">
                <div className="stat">
                  <span className="stat-label">Skills</span>
                  <span className="stat-value">{user?.skillsCount || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Mentoring Sessions</span>
                  <span className="stat-value">{user?.sessionCount || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">{user?.rating || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode - Controlled Components
        <form onSubmit={handleSubmit} className="profile-form">
          {updateSuccess && (
            <div className="alert alert-success">Profile updated successfully!</div>
          )}

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
            />
            {errors.firstName && touched.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
            />
            {errors.lastName && touched.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && touched.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={values.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tell us about yourself..."
              rows="5"
              className={`form-control ${errors.bio && touched.bio ? 'is-invalid' : ''}`}
              disabled={isSubmitting}
            />
            <small className="help-text">
              {500 - (values.bio?.length || 0)} characters remaining
            </small>
            {errors.bio && touched.bio && <span className="error-text">{errors.bio}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditMode(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
