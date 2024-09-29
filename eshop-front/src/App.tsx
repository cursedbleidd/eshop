//import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorPage } from './pages/ErrorPage'
import { MainPage } from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<MainPage />}/>
      <Route path='/login' element={<LoginPage />}/>
      <Route path='/admin' element={<AdminPage />}/>
      <Route path='*' element={<ErrorPage />}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
