export interface Activity {
	activity: string;
	cost: number;
  }
  
  export interface ItineraryDay {
	day: number;
	morning: Activity;
	afternoon: Activity;
	evening: Activity;
	_id: string;  // Mỗi ngày có _id riêng
  }
  
  export interface Itinerary {
	_id: string;
	user: string;        // userId dưới dạng string
	destination: string;
	duration: string;
	itinerary: ItineraryDay[];  // Mảng chứa các ngày trong lịch trình
  }
  