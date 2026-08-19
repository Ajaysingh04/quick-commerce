
import bgImg from '/images/addressbackground.jpg'

import css from './AddStoreSec.module.css';

import AddStoreFormCard from '../../../utils/Cards/AddStoreFormCard/AddStoreFormCard'

let AddStoreSec = () => {
    return <div className={css.outerDiv}>
        <div className={css.innerDiv}>
            <div className={css.imgBox}>
                <img className={css.img} src={bgImg} alt="background image" />
            </div>
            <div className={css.overlayDiv}>
                <div className={css.sec1}>
                    <div className={css.title}>
                        Cannot find your favourite store on Tomato?
                    </div>
                    <div className={css.tag}>
                        Submit the details and our team will get the store onboard
                    </div>
                </div>
                <div className={css.sec2}>
                    <AddStoreFormCard />
                </div>
            </div>
        </div>
    </div>
}

export default AddStoreSec;