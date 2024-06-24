import { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";

// Initial state for authentication
const INITIAL_STATE = {
  user: null,
  isLoggedIn: false,
  token: localStorage.getItem("token") || "", // Retrieve token from local storage if available
};

// Create the AuthContext with the initial state
export const AuthContext = createContext(INITIAL_STATE);

// AuthContextProvider component to provide authentication state and dispatch function to children components
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Effect to get the token from local storage when the component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      dispatch({ type: "GET_TOKEN", payload: storedToken });
    }
  }, []);

  // Effect to update the token in local storage whenever the state.token changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
