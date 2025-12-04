export interface GolfCart {
  id: number;
  name: string;
  status: string;
}

export interface Rental {
  id?: string;
  cartId: number;
  renterName: string;
  membershipNumber?: string | null;
  isMember: boolean;
  holes: number;
  startTime: string;
  endTime: string;
  phone: string;
  email: string;
  notes: string;
  price: number;
  status: string;
  createdAt?: any;
}
