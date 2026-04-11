import React, { useEffect } from 'react';
import { GrowthProvider, useGrowth } from '../context/GrowthContext';
import HeroSection from '../components/HeroSection';
import StreakGrid from '../components/StreakGrid';
import XPSystem from '../components/XPSystem';
import BadgesSection from '../components/BadgesSection';
import DailyMissions from '../components/DailyMissions';
import StatsPanel from '../components/StatsPanel';
import UnlockModal from '../components/UnlockModal';
import SummaryCard from '@/components/engagement/SummaryCard';
import GoalProgress from '@/components/engagement/GoalProgress';
import InsightsCard from '@/components/engagement/InsightsCard';

const GrowthDashboardContent: React.FC = () => {
  const { recordAction } = useGrowth();

  // Record dashboard visit on mount
  useEffect(() => {
    recordAction('visit_dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Hero Section — Above the fold */}
      <HeroSection />

      {/* 2. Above Grid: Growth Summary — High Signal Analytics */}
      <SummaryCard />

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Streak Grid + Daily Missions */}
        <div className="lg:col-span-2 space-y-8">
          <StreakGrid />
          <DailyMissions />
          <BadgesSection />
        </div>

        {/* Right Column: XP + Engagement Sidebar */}
        <div className="space-y-8">
          <InsightsCard />
          <XPSystem />
          <GoalProgress />
          <StatsPanel />
        </div>
      </div>

      {/* Unlock celebration modal (renders on top of everything) */}
      <UnlockModal />
    </div>
  );
};

const GrowthDashboardPage: React.FC = () => {
  return (
    <GrowthProvider>
      <GrowthDashboardContent />
    </GrowthProvider>
  );
};

export default GrowthDashboardPage;
