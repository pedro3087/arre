import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth/AuthContext';

export interface VelocityDay {
  day: string;
  completion: number;
  dateStr: string;
}

export interface DashboardStatsData {
  velocityData: VelocityDay[];
  efficiencyTrend: number; // e.g. +24
  highFocusToday: number;
  focusTrend: number; // e.g. +12
  tasksDoneToday: number;
  dailyGoal: number;
  loading: boolean;
}

export function useDashboardStats(): DashboardStatsData {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStatsData>({
    velocityData: [],
    efficiencyTrend: 0,
    highFocusToday: 0,
    focusTrend: 0,
    tasksDoneToday: 0,
    dailyGoal: 5, // Simple hardcoded goal for now
    loading: true
  });

  useEffect(() => {
    if (!user) {
      setStats(s => ({ ...s, loading: false }));
      return;
    }

    // Goal: Get all completed tasks from the last 7 days
    const now = new Date();
    // Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of 6 days ago (to get Full 7 days including today)
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    
    // Query completed tasks from the last 7 days.
    // Uses the composite index: status ASC, completedAt DESC.
    const q = query(
      tasksRef,
      where('status', '==', 'completed'),
      where('completedAt', '>=', sevenDaysAgo.toISOString()),
      orderBy('completedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        let completedAt = new Date();
        if (data.completedAt) {
          if (typeof data.completedAt === 'string') {
            completedAt = new Date(data.completedAt);
          } else if (data.completedAt.toDate) {
            completedAt = data.completedAt.toDate();
          }
        }
        return {
          id: doc.id,
          energy: data.energy || 'neutral',
          completedAt
        };
      });

      // 1. Build the last 7 days array
      const velocityMap = new Map<string, number>();
      const daysArray: VelocityDay[] = [];
      const formatOpts: Intl.DateTimeFormatOptions = { weekday: 'short' };
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayLabel = d.toLocaleDateString('en-US', formatOpts);
        velocityMap.set(dateStr, 0);
        daysArray.push({ day: dayLabel, completion: 0, dateStr });
      }

      // Add task counts
      let tasksDoneToday = 0;
      let tasksDoneYesterday = 0;
      let highFocusToday = 0;
      let highFocusYesterday = 0;
      
      const todayStr = startOfToday.toISOString().split('T')[0];
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const yesterdayStr = startOfYesterday.toISOString().split('T')[0];

      tasks.forEach(task => {
        const dateStr = task.completedAt.toISOString().split('T')[0];
        
        if (velocityMap.has(dateStr)) {
          velocityMap.set(dateStr, velocityMap.get(dateStr)! + 1);
        }

        if (dateStr === todayStr) {
          tasksDoneToday++;
          if (task.energy === 'high') highFocusToday++;
        } else if (dateStr === yesterdayStr) {
          tasksDoneYesterday++;
          if (task.energy === 'high') highFocusYesterday++;
        }
      });

      // Update daysArray with counts for charting
      daysArray.forEach(d => {
        d.completion = velocityMap.get(d.dateStr) || 0;
      });

      // Calculate efficiency trend (+X% compared to previous half of the week, or just compare to yesterday)
      // Let's compare today to yesterday for simple efficiency trend, or sum(last 3 days) vs sum(previous 3 days).
      // Let's just compare tasksDoneToday vs tasksDoneYesterday as a simple percentage
      let efficiencyTrend = 0;
      if (tasksDoneYesterday > 0) {
        efficiencyTrend = Math.round(((tasksDoneToday - tasksDoneYesterday) / tasksDoneYesterday) * 100);
      } else if (tasksDoneToday > 0) {
        efficiencyTrend = 100;
      }

      let focusTrend = 0;
      if (highFocusYesterday > 0) {
        focusTrend = Math.round(((highFocusToday - highFocusYesterday) / highFocusYesterday) * 100);
      } else if (highFocusToday > 0) {
        focusTrend = 100;
      }

      setStats({
        velocityData: daysArray,
        efficiencyTrend,
        highFocusToday,
        focusTrend,
        tasksDoneToday,
        dailyGoal: 5,
        loading: false
      });
    }, (err) => {
      console.error('Error fetching dashboard stats:', err);
      setStats(s => ({ ...s, loading: false }));
    });

    return () => unsubscribe();
  }, [user]);

  return stats;
}
