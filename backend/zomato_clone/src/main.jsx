import ReactDOM from 'react-dom/client'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import AddStore from './pages/AddStore/AddStore'
import ShowCase from './pages/ShowCase/ShowCase'
import StorePage from './pages/StorePage/StorePage'
import User from './pages/User/User'
import GetTheApp from './pages/GetTheApp/GetTheApp'
import ErrorPage from './pages/ErrorPage/ErrorPage'
import SkipedPage from './pages/SkipedPage/SkipedPage'
import UserSettingsPage from './pages/UserSettingsPage/UserSettingsPage'

import TestPage from './pages/TestPage/TestPage'
// import AddStoreHeader from './components/AddStoreHeader/AddStoreHeader'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route index element={<App />} />
      <Route path="/" element={<App />} />
      <Route path="/add-store" element={<AddStore />} />
      <Route path="/show-case" element={<ShowCase />} />
      <Route path="/user/:userId" element={<User />} />
      <Route path="/user/:userId/:hashId" element={<User />} />
      <Route path="/user/:userId/notifications" element={<SkipedPage />} />
      <Route path="/user/:userId/network" element={<SkipedPage />} />
      <Route path="/user/:userId/find-friends" element={<SkipedPage />} />
      <Route path="/user/:userId/settings" element={<UserSettingsPage />}/>
      <Route path="/get-the-app" element={<GetTheApp />} />
      <Route path="/:city/:hotel" element={<StorePage />} />
      <Route path="/:city/:hotel/:page" element={<StorePage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  </BrowserRouter>
)
