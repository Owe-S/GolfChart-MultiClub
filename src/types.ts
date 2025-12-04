export interface GolfCart {
  id: number;
  name: string;
  status: string;
}

export interface Rental {
  id?: string;
  cartId: number;
  renterName: string;
  playerId: string;
  holes: number;
  startTime: string;
  endTime: string;
  chargingEndTime: string;
  phone: string;
  email: string;
  notes: string;
  price: number;
  status: string;
  createdAt?: any;
  cancelledAt?: any;
  cancellationReason?: string;
}
