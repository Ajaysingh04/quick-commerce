import css from './SearchListedStore.module.css'

let SearchListedStore = () => {
    return <div className={css.outerDiv}>
        <div className={css.innerDiv}>
            <div className={css.title}>Already have your store listed?</div>
            <div className={css.tagLine}>Search here and claim the ownership of your store</div>
            <div className={css.searchBox}></div>
        </div>
    </div>
}

export default SearchListedStore;