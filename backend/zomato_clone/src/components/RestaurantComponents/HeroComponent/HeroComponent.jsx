import React from 'react'

import css from './HeroComponent.module.css'

import product1Img from '/images/product1.jpg';
import product2Img from '/images/product2.jpg';
import product3Img from '/images/product3.jpg';

import GalleryImgCard from '../../../utils/Cards/StoreHeroCards/GalleryImgCard/GalleryImgCard'
import AddPhotosCard from '../../../utils/Cards/StoreHeroCards/AddPhotosCard/AddPhotosCard'
import ViewGalleryImgCard from '../../../utils/Cards/StoreHeroCards/ViewGalleryImgCard/ViewGalleryImgCard'

const HeroComponent = () => {
  return <div className={css.outerDiv}>
    <div className={css.innerDiv}>
      <div className={css.scr1}>
        <GalleryImgCard imgSrc={product1Img} />
      </div>
      <div className={css.scr2}>
          <GalleryImgCard imgSrc={product2Img} />
          <ViewGalleryImgCard imgSrc={product1Img} />
          <GalleryImgCard imgSrc={product3Img} />
          <AddPhotosCard />
      </div>
    </div>
  </div>
}

export default HeroComponent