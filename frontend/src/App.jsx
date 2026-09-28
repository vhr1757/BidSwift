import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Auctions from "./pages/Auctions.jsx";
import AuctionDetails from "./pages/AuctionDetails.jsx";
import Wallet from "./pages/Wallet.jsx";
import MyBids from "./pages/MyBids.jsx";
import "./App.css";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/auctions"
                    element={<Auctions />}
                />

                <Route 
                       path="/auctions/:id" 
                    element={<AuctionDetails />} 
                />
                

                <Route
                    path="/wallet"
                    element={<Wallet />}
                />

                <Route
                    path="/my-bids"
                    element={<MyBids />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;