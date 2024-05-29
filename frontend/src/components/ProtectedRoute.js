// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element: Component, isLoggedIn, user, adminOnly = false, ...rest }) => {
//   return (
//     <Route
//       {...rest}
//       element={(props) => {
//         if (!isLoggedIn) {
//           return <Navigate to="/" />;
//         }
//         if (adminOnly && user.role !== 'admin') {
//           return <Navigate to="/" />;
//         }
//         return <Component {...props} />;
//       }}
//     />
//   );
// };

// export default ProtectedRoute;
