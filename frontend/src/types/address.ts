export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  postOfficeName: string | null;
  isDefault: boolean;
}

export interface UpsertAddressRequest {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  postOfficeName?: string;
  isDefault: boolean;
}

export interface PostOfficeOption {
  name: string;
  branchType: string | null;
  district: string | null;
  block: string | null;
  state: string | null;
}

export interface PincodeLookup {
  pincode: string;
  state: string;
  city: string;
  district: string;
  postOffices: PostOfficeOption[];
}
