import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Register from "./Pages/Register";
import { PrivateRoute } from "./components/route-guards/private-route";
import VerifyEmail from "./Pages/Verify-email";
import { FirebaseAuthProvider } from "./components/auth-providers/firebase-auth-provider";
import Verify2fa from "./Pages/Verify-2fa";
import Set2fa from "./Pages/Set-2fa";
import Profile from "./Pages/Profile";
import UserStatistics from "./Pages/User-Statistics";
import Resetpassword from "./Pages/Reset-password";
import Lobby from "./Pages/Lobby/Lobby";
import GameDetails from "./Pages/Lobby/GameDetails";
import Team from "./Pages/Team";
import MyTeams from "./Pages/My-Teams";
import TeamMembers from "./Pages/Team-Members";
import { Container } from '@mui/system';
import "./App.css";
import Header from "./components/header";
import QuestionsPage from "./Pages/Admin/questionPage";
import GamesPage from "./Pages/Admin/gamePage";
import Game from "./Pages/Game";
import AdminDashboard from "./Pages/Admin/adminDashboard";
import Leaderboard from "./Pages/Leaderboard/Index";

function App() {
  const publicRoutes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/verify-email", element: <VerifyEmail /> },
    { path: "/verify-2fa", element: <Verify2fa /> },
    { path: "/set-2fa", element: <Set2fa /> },
    { path: "/reset-password", element: <Resetpassword /> },

  ];

  const authRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/edit-profile", element: <Profile /> },
    { path: "/users/:userId", element: <UserStatistics /> },
    { path: "/lobby", element: <Lobby /> },
    { path: "/lobby/:id", element: <GameDetails /> },
    { path: "/game/:gameId", element: <Game /> },
    { path: "/teams", element: <Team /> },
    { path: "/my-teams", element: <MyTeams /> },
    { path: "/teams/:teamId", element: <TeamMembers /> },
    { path: "/leaderboard", element: <Leaderboard /> }
  ];
  const adminRoutes = [
    { path: "/question", element: <QuestionsPage /> },
    { path: "/games", element: <GamesPage /> },
    { path: "/adminDashboard", element: <AdminDashboard /> }
  ];

  return (
    <FirebaseAuthProvider>
      <BrowserRouter>
        <Header />
        <div className="container-layout">
          <Container maxWidth="lg" className="table-container">
            <Routes>
              {publicRoutes.map(({ path, element }, index) => (
                <Route key={index} path={path} element={element} />
              ))}

              {authRoutes.map(({ path, element }, index) => (
                // @ts-ignore
                <Route
                  key={index}
                  path={path}
                  element={<PrivateRoute>{element}</PrivateRoute>}
                />
              ))}
              {adminRoutes.map(({ path, element }, index) => (
                // @ts-ignore
                <Route
                  key={index}
                  path={path}
                  element={<PrivateRoute>{element}</PrivateRoute>}
                />
              ))}
            </Routes>
          </Container>
        </div>
      </BrowserRouter>
    </FirebaseAuthProvider>
  );
}

export default App;
