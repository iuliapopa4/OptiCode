import { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
  user: [],
  isLoggedIn: false,
  token: "",
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      dispatch({ type: "GET_TOKEN", payload: storedToken });
    }
  }, []);

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
