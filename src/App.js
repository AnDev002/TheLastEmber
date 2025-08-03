import { Route, Router, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './Pages/Page';

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
