export interface UpdateGuestPayload {
  id?: number;
  name: string;
  role: "ADMIN" | "USER";
  email: string;
  password?: string;
  phone: string;
  departmentId: number;
  activeStatus: boolean;
}
