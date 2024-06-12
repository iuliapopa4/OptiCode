const AuthReducer = (state, action) => {
  switch (action.type) {
    case "SIGNING":
      return {
        ...state,
        isLoggedIn: true,
      };
    case "GET_TOKEN":
      return {
        ...state,
        token: action.payload,
      };
    case "GET_USER":
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
      };
    case "UPDATE_STREAKS":
      return {
        ...state,
        user: {
          ...state.user,
          streaks: action.payload,
        },
      };
    case "UPDATE_MAXSTREAK":
      return {
        ...state,
        user: {
          ...state.user,
          maxStreak: action.payload,
        },
      };
    case "UPDATE_AVATAR":
      return {
        ...state,
        user: {
          ...state.user,
          avatar: action.payload,
        },
      };
    case "SIGNOUT":
      return {
        ...state,
        isLoggedIn: false,
        token: "",
        user: null,
      };
    default:
      return state;
  }
};

export default AuthReducer;
