import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.scss';

/**
 * Dashboard Page
 * Main landing page after login
 * Shows user stats and recent activity
 */
function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    skillsCount: 8,
    mentoringSessions: 5,
    completedCourses: 12,
    pointsEarned: 2450,
  });

  useEffect(() => {
    // Load dashboard data
    // In a real app, this would call a service
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
        <p>Here's what's happening with your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard title="Skills" value={stats.skillsCount} icon="🎯" color="blue" />
        <StatCard
          title="mentoring Sessions"
          value={stats.mentoringSessions}
          icon="👨‍🏫"
          color="green"
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          icon="📚"
          color="purple"
        />
        <StatCard title="Points Earned" value={stats.pointsEarned} icon="⭐" color="orange" />
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <ActivityTimeline />
      </div>

      {/* Recommendations */}
      <div className="dashboard-section">
        <h2>Recommended for You</h2>
        <RecommendationsList />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}

function ActivityTimeline() {
  const activities = [
    { date: '2 hours ago', action: 'Completed React Basics', type: 'success' },
    { date: '1 day ago', action: 'Started mentoring session with John', type: 'info' },
    { date: '3 days ago', action: 'Added 2 new skills', type: 'success' },
  ];

  return (
    <div className="activity-timeline">
      {activities.map((activity, index) => (
        <div key={index} className={`activity-item activity-${activity.type}`}>
          <div className="activity-marker"></div>
          <div className="activity-content">
            <p className="activity-action">{activity.action}</p>
            <p className="activity-date">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecommendationsList() {
  const recommendations = [
    {
      id: 1,
      title: 'Advanced TypeScript Patterns',
      mentor: 'Sarah Johnson',
      rating: 4.8,
    },
    {
      id: 2,
      title: 'System Design for Beginners',
      mentor: 'Mike Chen',
      rating: 4.9,
    },
    {
      id: 3,
      title: 'Web Performance Optimization',
      mentor: 'Emma Davis',
      rating: 4.7,
    },
  ];

  return (
    <div className="recommendations-grid">
      {recommendations.map((rec) => (
        <div key={rec.id} className="recommendation-card">
          <h3>{rec.title}</h3>
          <p className="mentor-name">by {rec.mentor}</p>
          <div className="rating">
            <span className="stars">⭐ {rec.rating}</span>
            <button className="btn-small">Learn More</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
