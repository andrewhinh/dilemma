"use client";

import React, { createContext, useReducer, useContext } from "react";

// Classes for objects returned by the backend
interface Property {
  property_url?: string;
  mls?: string;
  mls_id?: string;
  status?: string;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  style?: string;
  beds?: number;
  full_baths?: number;
  half_baths?: number;
  sqft?: number;
  year_built?: number;
  stories?: number;
  lot_sqft?: number;
  days_on_mls?: number;
  list_price?: number;
  list_date?: string;
  pending_date?: string;
  sold_price?: number;
  last_sold_date?: string;
  price_per_sqft?: number;
  hoa_fee?: number;
  latitude?: number;
  longitude?: number;
  parking_garage?: number;
  primary_photo?: string;
  alt_photos?: Array<any>;
  neighborhoods?: string;

  uuid?: string;
}

interface User {
  join_date?: Date;
  provider?: string;
  profile_picture?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  account_view?: string;
  is_sidebar_open?: boolean;
  uuid?: string;
  search_resuts?: Array<any>;
  requester_links?: Array<any>;
  receiver_links?: Array<any>;
}

interface SearchRequest {
  location: string;
  listing_type: string; // for_rent, for_sale, sold
  radius: number | null; // miles
  mls_only: boolean | null; // only show properties with MLS
  past_days: number | null;
  date_from: string | null; // "YYYY-MM-DD"
  date_to: string | null;
  foreclosure: boolean | null;

  min_price: number | null;
  max_price: number | null;
  min_beds: number | null;
  max_beds: number | null;
  min_baths: number | null;
  max_baths: number | null;
  style: string | null;
  min_sqft: number | null;
  max_sqft: number | null;
  min_lot_sqft: number | null;
  max_lot_sqft: number | null;
  min_stories: number | null;
  max_stories: number | null;
  min_year_built: number | null;
  max_year_built: number | null;
  min_price_per_sqft: number | null;
  max_price_per_sqft: number | null;
  hoa_fee: number | null;
  parking_garage: number | null;
}

interface SearchResult {
  replacements: Array<string>;
  popups: Array<number>;
  center_lat: number;
  center_long: number;
  properties: Array<Property>;
}

export type { Property, User, SearchRequest };

// State for the context
interface State extends User, SearchRequest, SearchResult {
  verifiedLoggedOut: boolean;
  isLoggedIn: boolean;
  getUserInfo: boolean;
}

const initialState: State = {
  join_date: new Date(),
  provider: "",
  profile_picture: "",
  email: "",
  first_name: "",
  last_name: "",
  account_view: "",
  is_sidebar_open: false,
  uuid: "",
  requester_links: [],
  receiver_links: [],

  location: "",
  listing_type: "for_sale",
  radius: null,
  mls_only: null,
  past_days: null,
  date_from: null,
  date_to: null,
  foreclosure: null,
  min_price: null,
  max_price: null,
  min_beds: null,
  max_beds: null,
  min_baths: null,
  max_baths: null,
  style: null,
  min_sqft: null,
  max_sqft: null,
  min_lot_sqft: null,
  max_lot_sqft: null,
  min_stories: null,
  max_stories: null,
  min_year_built: null,
  max_year_built: null,
  min_price_per_sqft: null,
  max_price_per_sqft: null,
  hoa_fee: null,
  parking_garage: null,

  replacements: [],
  popups: [],
  center_lat: 0,
  center_long: 0,
  properties: [],

  verifiedLoggedOut: false,
  isLoggedIn: false,
  getUserInfo: true,
};

interface Action {
  type: string;
  field?: keyof State;
  payload?: any;
}

interface ConstContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ConstContext = createContext<ConstContextType>({
  state: initialState,
  dispatch: () => undefined,
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_JOIN_DATE":
      return { ...state, join_date: action.payload };
    case "SET_PROVIDER":
      return { ...state, provider: action.payload };
    case "SET_PROFILE_PICTURE":
      return { ...state, profile_picture: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_FIRST_NAME":
      return { ...state, first_name: action.payload };
    case "SET_LAST_NAME":
      return { ...state, last_name: action.payload };
    case "SET_ACCOUNT_VIEW":
      return { ...state, account_view: action.payload };
    case "SET_IS_SIDEBAR_OPEN":
      return { ...state, is_sidebar_open: action.payload };
    case "SET_UUID":
      return { ...state, uuid: action.payload };
    case "SET_REQUESTER_LINKS":
      return { ...state, requester_links: action.payload };
    case "SET_RECEIVER_LINKS":
      return { ...state, receiver_links: action.payload };

    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "SET_LISTING_TYPE":
      return { ...state, listing_type: action.payload };
    case "SET_RADIUS":
      return { ...state, radius: action.payload };
    case "SET_MLS_ONLY":
      return { ...state, mls_only: action.payload };
    case "SET_PAST_DAYS":
      return { ...state, past_days: action.payload };
    case "SET_DATE_FROM":
      return { ...state, date_from: action.payload };
    case "SET_DATE_TO":
      return { ...state, date_to: action.payload };
    case "SET_FORECLOSURE":
      return { ...state, foreclosure: action.payload };
    case "SET_MIN_PRICE":
      return { ...state, min_price: action.payload };
    case "SET_MAX_PRICE":
      return { ...state, max_price: action.payload };
    case "SET_MIN_BEDS":
      return { ...state, min_beds: action.payload };
    case "SET_MAX_BEDS":
      return { ...state, max_beds: action.payload };
    case "SET_MIN_BATHS":
      return { ...state, min_baths: action.payload };
    case "SET_MAX_BATHS":
      return { ...state, max_baths: action.payload };
    case "SET_STYLE":
      return { ...state, style: action.payload };
    case "SET_MIN_SQFT":
      return { ...state, min_sqft: action.payload };
    case "SET_MAX_SQFT":
      return { ...state, max_sqft: action.payload };
    case "SET_MIN_LOT_SQFT":
      return { ...state, min_lot_sqft: action.payload };
    case "SET_MAX_LOT_SQFT":
      return { ...state, max_lot_sqft: action.payload };
    case "SET_MIN_STORIES":
      return { ...state, min_stories: action.payload };
    case "SET_MAX_STORIES":
      return { ...state, max_stories: action.payload };
    case "SET_MIN_YEAR_BUILT":
      return { ...state, min_year_built: action.payload };
    case "SET_MAX_YEAR_BUILT":
      return { ...state, max_year_built: action.payload };
    case "SET_MIN_PRICE_PER_SQFT":
      return { ...state, min_price_per_sqft: action.payload };
    case "SET_MAX_PRICE_PER_SQFT":
      return { ...state, max_price_per_sqft: action.payload };
    case "SET_HOA_FEE":
      return { ...state, hoa_fee: action.payload };
    case "SET_PARKING_GARAGE":
      return { ...state, parking_garage: action.payload };

    case "SET_REPLACEMENTS":
      return { ...state, replacements: action.payload };
    case "SET_POPUPS":
      return { ...state, popups: action.payload };
    case "SET_CENTER_LAT":
      return { ...state, center_lat: action.payload };
    case "SET_CENTER_LONG":
      return { ...state, center_long: action.payload };
    case "SET_PROPERTIES":
      return { ...state, properties: action.payload };

    case "SET_VERIFIED_LOGGED_OUT":
      return { ...state, verifiedLoggedOut: action.payload };
    case "SET_LOGGED_IN":
      return { ...state, isLoggedIn: action.payload };
    case "SET_GET_USER_INFO":
      return { ...state, getUserInfo: action.payload };
    default:
      return state;
  }
};

export const useConst = () => useContext(ConstContext);

export const ConstProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = { state, dispatch };

  return (
    <ConstContext.Provider value={contextValue}>
      {children}
    </ConstContext.Provider>
  );
};
