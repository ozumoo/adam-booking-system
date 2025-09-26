import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from '../availability/availability.repository';
import { BookingRepository } from './booking.repository';
import { PainterService } from '../painter/painter.service';

export interface RecommendedSlot {
  painterId: number;
  painterName: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  reason: string;
  timeDifference: number;
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly painterService: PainterService,
  ) {}

  async findClosestAvailableSlots(
    requestedDate: string,
    requestedStartTime: string,
    requestedEndTime: string,
    painterId?: number,
    limit: number = 5
  ): Promise<RecommendedSlot[]> {
    const recommendations: RecommendedSlot[] = [];
    
    // Check same day first
    const sameDaySlots = await this.findSlotsOnDate(requestedDate, requestedStartTime, requestedEndTime, painterId);
    recommendations.push(...sameDaySlots);
    
    // If not enough slots, check nearby days
    if (recommendations.length < limit) {
      const nearbySlots = await this.findNearbyDaySlots(requestedDate, requestedStartTime, requestedEndTime, painterId, limit - recommendations.length);
      recommendations.push(...nearbySlots);
    }
    
    // If still no recommendations, provide basic fallback
    if (recommendations.length === 0) {
      const fallbackRecommendations = await this.getFallbackRecommendations(requestedDate, requestedStartTime, requestedEndTime, limit);
      recommendations.push(...fallbackRecommendations);
    }
    
    return recommendations.slice(0, limit);
  }

  private async findSlotsOnDate(
    date: string,
    requestedStartTime: string,
    requestedEndTime: string,
    painterId?: number
  ): Promise<RecommendedSlot[]> {
    const recommendations: RecommendedSlot[] = [];
    const requestedDate = new Date(date);
    
    const availabilities = await this.availabilityRepository.findAll();
    // Filter availabilities that are on the same date or within a reasonable range
    const dayAvailabilities = availabilities.filter(av => {
      const availDate = new Date(av.startTime);
      return availDate.toDateString() === requestedDate.toDateString();
    });
    
    // If no availabilities for this day, return empty
    if (dayAvailabilities.length === 0) {
      return recommendations;
    }
    
    for (const availability of dayAvailabilities) {
      if (painterId && availability.painterUserId !== painterId) continue;
      
      const slots = await this.findAvailableSlotsInAvailability(
        availability,
        date,
        requestedStartTime,
        requestedEndTime
      );
      
      for (const slot of slots) {
        const painter = await this.painterService.findByUserId(availability.painterUserId);
        if (painter) {
          // Get painter name safely
          let painterName = 'Unknown Painter';
          if (painter.user && painter.user.name) {
            painterName = painter.user.name;
          } else {
            painterName = `Painter ${painter.userId}`;
          }
          
          recommendations.push({
            painterId: availability.painterUserId,
            painterName,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: this.getDayOfWeek(new Date(date)),
            reason: this.getRecommendationReason(requestedStartTime, requestedEndTime, slot.startTime, slot.endTime),
            timeDifference: this.calculateTimeDifference(requestedStartTime, slot.startTime)
          });
        }
      }
    }
    
    // Sort by time difference first, then by painter rating
    const sortedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const painter = await this.painterService.findByUserId(rec.painterId);
          return {
            ...rec,
            painterRating: Number(painter?.rating) || 0
          };
        } catch (error) {
          // Skip painters without profiles
          return {
            ...rec,
            painterRating: 0
          };
        }
      })
    );
    
    return sortedRecommendations.sort((a, b) => {
      // First priority: painter rating (highest first)
      if (a.painterRating !== b.painterRating) {
        return b.painterRating - a.painterRating;
      }
      // Second priority: time difference (smallest first)
      return a.timeDifference - b.timeDifference;
    });
  }

  private async findNearbyDaySlots(
    requestedDate: string,
    requestedStartTime: string,
    requestedEndTime: string,
    painterId?: number,
    limit: number = 3
  ): Promise<RecommendedSlot[]> {
    const recommendations: RecommendedSlot[] = [];
    const requestedDateObj = new Date(requestedDate);
    
    // Check next 7 days
    for (let i = 1; i <= 7 && recommendations.length < limit; i++) {
      const checkDate = new Date(requestedDateObj);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const slots = await this.findSlotsOnDate(dateStr, requestedStartTime, requestedEndTime, painterId);
      recommendations.push(...slots.slice(0, limit - recommendations.length));
    }
    
    return recommendations;
  }

  private async findAvailableSlotsInAvailability(
    availability: any,
    date: string,
    requestedStartTime: string,
    requestedEndTime: string
  ): Promise<{ startTime: string; endTime: string }[]> {
    const slots: { startTime: string; endTime: string }[] = [];
    
    // Get existing bookings for this painter on this date
    const bookings = await this.bookingRepository.findAll();
    const painterBookings = bookings.filter(booking => 
      booking.painterUserId === availability.painterUserId && 
      (booking.date instanceof Date ? booking.date.toISOString().split('T')[0] : booking.date) === date &&
      booking.status !== 'cancelled'
    );
    
    // Find available slots within the availability window
    const availStart = this.parseTime(availability.startTime);
    const availEnd = this.parseTime(availability.endTime);
    const reqStart = this.parseTime(requestedStartTime);
    const reqEnd = this.parseTime(requestedEndTime);
    
    // Try to find a slot that includes the requested time
    if (reqStart >= availStart && reqEnd <= availEnd) {
      // Check if this exact slot is available
      const hasConflict = painterBookings.some(booking => {
        const bookingStart = this.parseTime(booking.startTime);
        const bookingEnd = this.parseTime(booking.endTime);
        return reqStart < bookingEnd && reqEnd > bookingStart;
      });
      
      if (!hasConflict) {
        slots.push({
          startTime: requestedStartTime,
          endTime: requestedEndTime
        });
      }
    }
    
    // If exact slot not available, find alternative slots
    if (slots.length === 0) {
      const alternativeSlots = this.findAlternativeSlots(availability, painterBookings, requestedStartTime, requestedEndTime);
      slots.push(...alternativeSlots);
    }
    
    return slots;
  }

  private findAlternativeSlots(
    availability: any,
    bookings: any[],
    requestedStartTime: string,
    requestedEndTime: string
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];
    const availStart = this.parseTime(availability.startTime);
    const availEnd = this.parseTime(availability.endTime);
    const reqStart = this.parseTime(requestedStartTime);
    const reqEnd = this.parseTime(requestedEndTime);
    const duration = reqEnd - reqStart;
    
    // Try slots before the requested time
    for (let start = availStart; start <= reqStart && slots.length < 2; start += 30) {
      const end = start + duration;
      if (end <= availEnd) {
        const startTime = this.formatTime(start);
        const endTime = this.formatTime(end);
        
        const hasConflict = bookings.some(booking => {
          const bookingStart = this.parseTime(booking.startTime);
          const bookingEnd = this.parseTime(booking.endTime);
          return start < bookingEnd && end > bookingStart;
        });
        
        if (!hasConflict) {
          slots.push({ startTime, endTime });
        }
      }
    }
    
    // Try slots after the requested time
    for (let start = reqEnd; start <= availEnd - duration && slots.length < 2; start += 30) {
      const end = start + duration;
      const startTime = this.formatTime(start);
      const endTime = this.formatTime(end);
      
      const hasConflict = bookings.some(booking => {
        const bookingStart = this.parseTime(booking.startTime);
        const bookingEnd = this.parseTime(booking.endTime);
        return start < bookingEnd && end > bookingStart;
      });
      
      if (!hasConflict) {
        slots.push({ startTime, endTime });
      }
    }
    
    return slots;
  }

  private getRecommendationReason(
    requestedStartTime: string,
    requestedEndTime: string,
    recommendedStartTime: string,
    recommendedEndTime: string
  ): string {
    if (requestedStartTime === recommendedStartTime && requestedEndTime === recommendedEndTime) {
      return 'Exact time slot available';
    }
    
    const timeDiff = this.calculateTimeDifference(requestedStartTime, recommendedStartTime);
    if (timeDiff <= 60) {
      return 'Within 1 hour of requested time';
    } else if (timeDiff <= 120) {
      return 'Within 2 hours of requested time';
    } else {
      return 'Alternative time slot available';
    }
  }

  private calculateTimeDifference(requestedTime: string, recommendedTime: string): number {
    const requested = this.parseTime(requestedTime);
    const recommended = this.parseTime(recommendedTime);
    return Math.abs(recommended - requested);
  }

  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private async getFallbackRecommendations(
    requestedDate: string,
    requestedStartTime: string,
    requestedEndTime: string,
    limit: number
  ): Promise<RecommendedSlot[]> {
    const recommendations: RecommendedSlot[] = [];
    const availabilities = await this.availabilityRepository.findAll();
    const painters = await this.painterService.findAll();
    
    // Get next 7 days
    const requestedDateObj = new Date(requestedDate);
    
    for (let i = 1; i <= 7 && recommendations.length < limit; i++) {
      const checkDate = new Date(requestedDateObj);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeek(checkDate);
      
      const dayAvailabilities = availabilities.filter(av => {
        const availDate = new Date(av.startTime);
        return availDate.toDateString() === checkDate.toDateString();
      });
      
      for (const availability of dayAvailabilities.slice(0, limit - recommendations.length)) {
        const painter = painters.find(p => p.userId === availability.painterUserId);
        if (painter) {
          // Get painter name safely - either from user relation or fallback
          let painterName = 'Unknown Painter';
          if (painter.user && painter.user.name) {
            painterName = painter.user.name;
          } else {
            // If user relation is not loaded, try to get it separately
            try {
              const painterWithUser = await this.painterService.findByUserId(painter.userId);
              if (painterWithUser && painterWithUser.user && painterWithUser.user.name) {
                painterName = painterWithUser.user.name;
              }
            } catch (error) {
              // If we can't get the user info, use fallback name
              painterName = `Painter ${painter.userId}`;
            }
          }
          
          recommendations.push({
            painterId: availability.painterUserId,
            painterName,
            date: dateStr,
            startTime: new Date(availability.startTime).toTimeString().substring(0, 5), // Convert to "09:00"
            endTime: new Date(availability.endTime).toTimeString().substring(0, 5),
            dayOfWeek,
            reason: 'Alternative time slot available',
            timeDifference: i * 24 * 60 // Days difference in minutes
          });
        }
      }
    }
    
    // Sort recommendations by painter rating (highest first), then by time difference
    const sortedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          const painter = await this.painterService.findByUserId(rec.painterId);
          return {
            ...rec,
            painterRating: Number(painter?.rating) || 0
          };
        } catch (error) {
          return {
            ...rec,
            painterRating: 0
          };
        }
      })
    );
    
    return sortedRecommendations.sort((a, b) => {
      // First priority: painter rating (highest first)
      if (a.painterRating !== b.painterRating) {
        return b.painterRating - a.painterRating;
      }
      // Second priority: time difference (smallest first)
      return a.timeDifference - b.timeDifference;
    });
  }
}
