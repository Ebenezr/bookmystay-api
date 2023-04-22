export interface UpdateGuestPayload {
  id?: number;
  name: string;
  phone1: string;
  phone2: string;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  imgUrl?: string | null;
}

export interface UpdateStaffPayload {
  id?: number;
  name: string;
  role: "ADMIN" | "USER";
  email: string;
  password?: string;
  phone: string;
  departmentId: number;
  activeStatus: boolean;
}
