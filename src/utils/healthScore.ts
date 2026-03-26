interface ApiData {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'down' | 'checking' | 'slow';
  avgResponseTime?: number;
  uptime?: number;
  errorRate?: number;
  lastChecked?: string;
}

interface HealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

export const calculateHealthScore = (api: ApiData): HealthScore => {
  // Weight factors for health calculation
  const weights = {
    uptime: 0.5,      // 50% weight on uptime
    responseTime: 0.3, // 30% weight on response time
    errorRate: 0.2    // 20% weight on error rate
  };

  // Calculate individual scores (0-100)
  const uptimeScore = api.uptime || 0;
  
  // Response time score: lower is better
  // 0-100ms = 100 points, 100-500ms = scaled, 500ms+ = 0 points
  let responseTimeScore = 100;
  if (api.avgResponseTime) {
    if (api.avgResponseTime <= 100) {
      responseTimeScore = 100;
    } else if (api.avgResponseTime <= 500) {
      responseTimeScore = 100 - ((api.avgResponseTime - 100) / 400) * 100;
    } else {
      responseTimeScore = 0;
    }
  }
  
  // Error rate score: lower is better
  // 0% = 100 points, 0-5% = scaled, 5%+ = 0 points
  let errorRateScore = 100;
  if (api.errorRate) {
    if (api.errorRate <= 0) {
      errorRateScore = 100;
    } else if (api.errorRate <= 5) {
      errorRateScore = 100 - (api.errorRate / 5) * 100;
    } else {
      errorRateScore = 0;
    }
  }

  // Calculate weighted total score
  const totalScore = Math.round(
    (uptimeScore * weights.uptime) +
    (responseTimeScore * weights.responseTime) +
    (errorRateScore * weights.errorRate)
  );

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';
  else grade = 'F';

  return {
    score: totalScore,
    grade,
    factors: {
      uptime: uptimeScore,
      responseTime: responseTimeScore,
      errorRate: errorRateScore
    }
  };
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 80) return 'text-blue-600 dark:text-blue-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 60) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

export const getHealthScoreBgColor = (score: number): string => {
  if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
  if (score >= 80) return 'bg-blue-100 dark:bg-blue-900/20';
  if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
  if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/20';
  return 'bg-red-100 dark:bg-red-900/20';
};
