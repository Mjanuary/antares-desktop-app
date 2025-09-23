// ---- User Info ----
interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

// ---- Role Info ----
interface Role {
  id: string;
  name: string;
  description: string;
  level: string;
  access: string;
  status: boolean;
  created_date: string; // ISO date
  updated_date: string; // ISO date
}

// ---- Branch Info ----
interface Branch {
  id: string;
  name: string;
  country: string;
  address: string;
  contacts: string;
  branch_currency: string;
  supported_currency: string;
  rate_in: Record<string, number>;
  rate_out: Record<string, number>;
  active: boolean;
  active_store: boolean;
  created_date: string; // ISO date
  updated_date: string; // ISO date
  show_rate_card: boolean;
  remember_rate_on_sale: boolean;
  remember_price_on_re_sale: boolean;
  show_rate_on_all_forms: boolean;
}

// ---- Branch + Role Context ----
interface BranchContext {
  role: Role;
  branch: Branch;
}

// ---- User Context ----
interface UserInfo {
  user: User;
  branch: BranchContext;
}

// ---- Main Device Connection ----
export interface DeviceConnection {
  id: string;
  user_id: string;
  device_name: string;
  app_type: string;
  device_info: string | null;
  user_info: UserInfo;
  user_name: string;
  email: string;
  verification_code: string;
  approval_code: string;
  device_connected: boolean;
  connection_date: string | null;
  connection_id: string;
  blocked: boolean;
  blocked_time: string | null;
  branch_id: string;
  created_by: string;
  created_time: string; // ISO date
  updated_time: string; // ISO date
}
