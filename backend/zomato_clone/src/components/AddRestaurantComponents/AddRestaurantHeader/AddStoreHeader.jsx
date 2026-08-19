import { useState } from 'react';
import { Link } from 'react-router-dom'

import Navbar from '../../Navbars/NavigationBar/NavigationBar'
import AddStoreMobileNavbar from '../../Navbars/AddStoreMobileNavbar/AddStoreMobileNavbar';

import css from './AddStoreHeader.module.css'

import banner from '/banners/banner2.jpg'

let AddStoreHeader = () => {
    let [toogleMenu, setToggleMenu] = useState(true);

    let toggleBanner = toogleMenu ? (<div className={css.banner}>
        <Navbar setToggleMenu={setToggleMenu} toogleMenu={toogleMenu} page="add-store" />
        <div className={css.bannerInner}>
            <img src={banner} alt="banner" className={css.bannerImg} />
            <div className={css.bannerTxt}>
                <div className={css.title}>Register your store on Zomato</div>
                <div className={css.tag}>for free and get more customers!</div>
                <div className={css.btns}>
                    <Link to='/' className={css.btn}>Register your store</Link>
                    <Link to='/' className={css.btn}>Store already listed? Claim now</Link>
                </div>
            </div>
        </div>
    </div>) : <AddStoreMobileNavbar setToggleMenu={setToggleMenu} toogleMenu={toogleMenu} />

    return toggleBanner;
}

export default AddStoreHeader;