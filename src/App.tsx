import "./App.css";
import "react-loading-skeleton/dist/skeleton.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { RoomPage } from "./pages/rooms/room";
import { RoomsPage } from "./pages/rooms";
import { NothelloLogo } from "./components/helpers/NothelloLogo";
import { NotFoundPage } from "./pages/NotFound";

/** @jsxImportSource @emotion/react */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NothelloLogo />}>
          <Route index element={<IndexPage />} />
          <Route path="rooms">
            <Route index element={<RoomsPage />} />
            <Route path="create" element={<RoomPage />} />
            <Route path=":roomId" element={<RoomPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
