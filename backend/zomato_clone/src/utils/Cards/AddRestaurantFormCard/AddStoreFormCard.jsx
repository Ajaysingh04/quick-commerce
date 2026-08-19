import {useState} from 'react'
import { Link } from 'react-router-dom'

import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import TextUtil from '../../FormUtils/TextUtil/TextUtil'
import TelUtil from '../../FormUtils/TelUtil/TelUtil'
import TextAreaUtil from '../../FormUtils/TextAreaUtil/TextAreaUtil'

import css from './AddStoreFormCard.module.css';

let AddStoreFormCard = () => {

    let [initialValues, setInitialValues] = useState({ 
        restName: '',
        location: '',
        phone: '',
        message: '' 
    })
    let validationSchema = Yup.object({
        restName: Yup.string()
        .min(5, 'Minimum 5 characters required')
        .max(15, 'Must be less than 15 characters')
        .required('Required'),
        location: Yup.string().required('Required'),
        phone: Yup.string(),
        message: Yup.string(),
    })

    let submitForm = (values, { setSubmitting }) => {
        console.log(values, "submited");
    }

    return <div className={css.outerDiv}>
        <div className={css.innerDiv}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={submitForm}
                className={css.formikForm}
            >
                <Form className={css.form}>
                    <TextUtil name="restName" placeholder="Store name*"/>
                    <TextUtil name="location" placeholder="Store location*"/>
                    <TelUtil name="phone" placeholder="Store contact number"/>
                    <TextAreaUtil name="message" placeholder="What do you like about the Store?" />
                    <button type='submit' className={css.btn}>Submit</button>
                </Form>
            </Formik>
            <div className={css.tag}>Store owners can <Link to='' className={css.link}>add store from here</Link></div>
        </div>
    </div>
}

export default AddStoreFormCard;