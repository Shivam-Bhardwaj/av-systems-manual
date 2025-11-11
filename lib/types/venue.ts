export type VenueCategory = 'corporate' | 'education' | 'worship' | 'entertainment' | 'hospitality';

export type VenueType = 
  // Corporate
  | 'conference-room-small' // 4-8 people
  | 'conference-room-medium' // 10-20 people
  | 'conference-room-large' // 20-40 people
  | 'boardroom' // Executive meeting space
  | 'training-room' // 30-50 people
  | 'huddle-space' // 2-4 people
  // Education
  | 'classroom-small' // 20-30 students
  | 'classroom-large' // 30-50 students
  | 'lecture-hall' // 50-150 students
  | 'auditorium' // 150-500 seats
  | 'laboratory' // Specialized teaching space
  // Worship
  | 'chapel' // 50-150 seats
  | 'sanctuary-small' // 150-300 seats
  | 'sanctuary-medium' // 300-600 seats
  | 'sanctuary-large' // 600+ seats
  | 'fellowship-hall' // Multi-purpose space
  // Entertainment
  | 'theater-small' // 100-300 seats
  | 'theater-medium' // 300-800 seats
  | 'theater-large' // 800+ seats
  | 'nightclub' // Standing/dancing venue
  | 'restaurant-bar' // Background music venue
  // Hospitality
  | 'hotel-ballroom' // Divisible multi-purpose
  | 'hotel-meeting' // Standard meeting room
  | 'restaurant-dining' // Background music
  | 'retail-small' // Small shop
  | 'retail-large'; // Department store

export interface VenueSpecifications {
  type: VenueType;
  category: VenueCategory;
  dimensions: {
    length: number; // meters
    width: number; // meters
    height: number; // meters
  };
  capacity: {
    seated: number;
    standing?: number;
  };
  acoustics: {
    ambientNoise: number; // dBA
    targetRT60: number; // seconds
    targetSTI: number; // 0-1 scale
    targetSPL: {
      average: number; // dB
      peak: number; // dB
    };
  };
  useCases: string[];
  architecturalConstraints?: string[];
}
