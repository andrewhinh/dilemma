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
  neighborhoods?: string;

  uuid?: string;
  alt_photos?: Array<any>;
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
  requester_links?: Array<any>;
  receiver_links?: Array<any>;
}

export type { Property, User };

// State for the context
interface State extends User {
  verifiedLoggedOut: boolean;
  isLoggedIn: boolean;
  getUserInfo: boolean;
  location: string;
  replacements: Array<string>;
  properties: Array<Property>;
}

const initialState: State = {
  verifiedLoggedOut: false,
  isLoggedIn: false,
  getUserInfo: true,
  location: "",
  replacements: [],
  properties: [],
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
    case "SET_VERIFIED_LOGGED_OUT":
      return { ...state, verifiedLoggedOut: action.payload };
    case "SET_LOGGED_IN":
      return { ...state, isLoggedIn: action.payload };
    case "SET_GET_USER_INFO":
      return { ...state, getUserInfo: action.payload };
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "SET_REPLACEMENTS":
      return { ...state, replacements: action.payload };
    case "SET_PROPERTIES":
      return { ...state, properties: action.payload };
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
