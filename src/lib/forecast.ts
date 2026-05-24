export interface DayForecast {
  date: Date;
  predictedUtilization: number;
  confidence: "high" | "medium" | "low";
}

export function forecastDemand(historicalBookings: any[]): DayForecast[] {
  // Simple 7-day demand forecast using day-of-week averages
  const dayOfWeekAverages = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const dayBookings = historicalBookings.filter(
      (b) => new Date(b.startTime).getDay() === day
    );
    if (dayBookings.length === 0) return 0.55; // default 55%
    
    // Average utilization calculation based on bookings counts
    const totalBookingsCount = dayBookings.length;
    // Normalize count: let's assume a benchmark of 8 bookings per day per space as high capacity
    // Scale it to a percentage between 20% and 95%
    const calculatedUtil = (totalBookingsCount / 24);
    return Math.min(0.92, Math.max(0.35, calculatedUtil)); 
  });

  const next7Days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    next7Days.push(d);
  }

  return next7Days.map((date) => {
    const day = date.getDay();
    let predicted = dayOfWeekAverages[day];
    
    // Add minor realistic variation based on date index
    predicted += ((date.getDate() % 5) - 2) * 0.03;
    
    // Low usage on weekends by default
    if (day === 0 || day === 6) {
      predicted = Math.max(0.12, predicted * 0.25);
    }
    
    predicted = Math.min(0.95, Math.max(0.10, predicted));

    return {
      date,
      predictedUtilization: Math.round(predicted * 100),
      confidence: historicalBookings.length > 30 ? "high" : "medium",
    };
  });
}
export function next7Days() {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(now.getDate() + i);
    dates.push(d);
  }
  return dates;
}
