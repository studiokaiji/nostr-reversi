import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { RoomPage } from "./pages/rooms/room";

/** @jsxImportSource @emotion/react */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<IndexPage />} />
          <Route path="rooms">
            <Route path="create" element={<RoomPage />} />
            <Route path=":roomId" element={<RoomPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
