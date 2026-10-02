export interface UserData {
  id: number;
  auth_token?: string;
  authToken?: string;
  mobile_number?: string;
  mobileNumber?: string;
  password?: string;
  frist_name?: string;
  fristName?: string;
  last_name?: string;
  lastName?: string;
  gender?: string;
  blood_group?: string;
  bloodGroup?: string;
  dob?: string;
  age?: number;
  maritual_status?: string;
  maritualStatus?: string;
  any_disablity?: string;
  anyDisablity?: string;
  desis_desc?: string | null;
  desisDesc?: string | null;
  has_mediclaim?: string;
  hasMediclaim?: string;
  house_no?: string;
  houseNo?: string;
  city?: string | null;
  pincode?: string | number | null;
  photo?: string;
  police_station_id?: string | number;
  policeStationId?: string | number;
  country?: string;
  device_token?: string | null;
  deviceToken?: string | null;
  status?: string;
  is_accept?: number | string;
  isAccept?: number | string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  state?: string;
  is_handicaped?: string;
  isHandicaped?: string;
  has_co?: string;
  hasCo?: string;
  co_name?: string | null;
  coName?: string | null;
  co_contact_number?: string | null;
  coContactNumber?: string | null;
}

export interface LoginResponse {
  response: string;
  userData?: UserData;
}

export interface SimpleResponse {
  response: string;
}

export interface CityItem {
  id: number;
  city_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CityListResponse {
  response: string;
  city_list?: CityItem[];
}

export interface PoliceStationDatum {
  id: number;
  police_station_name: string;
  city: string;
}

export interface PoliceStationResponse {
  response: string;
  police_station_data?: PoliceStationDatum[];
}

export interface PoliceContactData {
  id: number;
  auth_token?: string;
  police_station_name?: string;
  incharge_name?: string;
  area?: string;
  pincode?: string;
  station_type?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  city?: string;
  email_id?: string;
  state?: string;
  country?: string;
  is_approved?: number;
  status?: number;
}

export interface PoliceContactResponse {
  response: string;
  userData?: PoliceContactData;
}

export interface MyHelpItem {
  id: number;
  help_type?: string;
  police_id?: string;
  user_id?: number;
  is_accept?: number | string;
  status?: number;
  date?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  perfomed_by?: string;
  compliteed_by_id?: number;
  having_voice_file?: string;
}

export interface MyHelpListResponse {
  response: string;
  data?: MyHelpItem[];
}

export interface StatusCheckResponse {
  response: string;
  data?: Array<{ is_accept: number | string }>;
}

export interface VersionData {
  id?: number;
  version?: string;
  text?: string;
  subject?: string;
}

export interface VersionCheckResponse {
  response: string;
  version?: VersionData;
}

export interface VisitItem {
  id: number;
  description?: string;
  image?: string;
  is_complite?: number;
  perfomed_by?: string;
  perfomedBy?: string;
  police_station_id?: string;
  policeStationId?: string;
  date_time?: string;
  dateTime?: string;
  presenter_id?: number;
  presenterId?: number;
  mobile_number?: string;
  mobileNumber?: string;
  photo?: string;
  house_no?: string;
  houseNo?: string;
  city?: string;
  pincode?: number | string;
  frist_name?: string;
  fristName?: string;
  last_name?: string;
  lastName?: string;
}

export interface VisitResponse {
  response: string;
  data?: VisitItem[];
}

export type RootStackParamList = {
  Splash: undefined;
  NoInternet: undefined;
  Login: undefined;
  Register: undefined;
  RegisterDetails: {
    selectedImagePath: string;
    isSelf: boolean;
    isCareOf: boolean;
    coName: string;
    coMobile: string;
  };
  Home: undefined;
  MyHelps: undefined;
  VisitView: undefined;
  Profile: undefined;
  AudioPlayer: undefined;
  AudioPlay: { audioUrl: string };
  ImageDetails: { imageUrl: string; title: string };
  Privacy: undefined;
};
