import {useState} from 'react'

import css from './StorePage.module.css'

import NavigationBar from '../../components/Navbars/NavigationBar2/NavigationBar2'
import DownloadAppUtil from '../../utils/StoreUtils/DownloadAppUtil/DownloadAppUtil'
import HeroComponent from '../../components/StoreComponents/HeroComponent/HeroComponent'
import OrderTitleComponent from '../../components/StoreComponents/OrderTitleComponent/OrderTitleComponent'
import OrderBodyComponent from '../../components/StoreComponents/OrderBodyComponent/OrderBodyComponent'
import Footer from '../../components/Footer/Footer'

const StorePage = () => {

  return <div className={css.outerDiv}>
    <NavigationBar />
    <div className={css.innerDiv}>
        <div className={css.breadcrumb}>
            Home
            /
            India
            /
            Hyderabad
            /
            Hyderabad City
            /
            Indira Nagar
        </div>
    </div>
    <HeroComponent />
    <div className={css.innerDiv2}>
      <OrderTitleComponent />
      <OrderBodyComponent />
    </div>
    <Footer />
  </div>
}

export default StorePage