import AddStoreHeader from '../../components/AddStoreComponents/AddStoreHeader/AddStoreHeader';
import WhyShouldYouPWZ from '../../components/AddStoreComponents/WhyShouldYouPWZ/WhyShouldYouPWZ';
import HowItWorks from '../../components/AddStoreComponents/HowItWorks/HowItWorks';
import SearchListedStore from '../../components/AddStoreComponents/SearchListedStore/SearchListedStore';
import SmallBannerCard from '../../utils/Cards/SmallBannerCard/SmallBannerCard';
import FrequentlyAskedQues from '../../components/HomeComponents/FrequentlyAskedQues/FrequentlyAskedQues';
import AddStoreSec from '../../components/AddStoreComponents/AddStoreSec/AddStoreSec';
import Footer from '../../components/Footer/Footer';

import css from './AddStore.module.css'

let AddStore = () => {
    return <div>
        <AddStoreHeader />
        <WhyShouldYouPWZ />
        <HowItWorks />
        <SearchListedStore />
        <SmallBannerCard />
        <FrequentlyAskedQues />
        <AddStoreSec />
        <Footer />
    </div>
}

export default AddStore;