export interface VehicleDetails {
  makeModel: string;
  licensePlate: string;
  color?: string;
}

export interface OwnerInfo {
  name: string;
  phone: string;
  email: string;
  vehicleRegistered: string;
}

export interface FineNotification {
  sentAt: string;
  sentDate: string;
  citationNumber: string;
  channel: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientName: string;
  vehiclePlate: string;
  fineAmount: number;
  violation: string;
  location: string;
  paymentDue: string;
  messagePreview: string;
  isPaid?: boolean;
  paidAt?: string;
}

export interface ParkingCase {
  id: string;
  timestamp: string;
  createdAt: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  vehicleDetails: VehicleDetails;
  violationType: string;
  isViolation: boolean;
  confidenceScore: number;
  proofSummary: string;
  fineAmount: number;
  penaltyCode: string;
  status: 'PENDING_REVIEW' | 'VALIDATED' | 'DISMISSED';
  ownerInfo: OwnerInfo;
  notificationSent?: FineNotification | null;
}

export interface AIAnalysisResult {
  isViolation: boolean;
  violationType: string;
  confidenceScore: number;
  vehicleMakeModel: string;
  licensePlate: string;
  proofSummary: string;
  locationDescription: string;
  suggestedFine: number;
  penaltyCode: string;
}
