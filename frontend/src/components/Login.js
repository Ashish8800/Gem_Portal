import axios from 'axios'
import React, { useState } from 'react'
import { isValid, isWithinInterval } from 'date-fns';

const Login = () => {

    const [keywords, setKeywords] = useState('');
    const [emails, setEmails] = useState('');
    const [endFromDate, setEndFromDate] = useState('');
    const [endToDate, setEndToDate] = useState('');

    const [isEndFromDateFilled, setIsEndFromDateFilled] = useState(false);
    const [isEndToDateFilled, setIsEndToDateFilled] = useState(false);


    const handleEndFromDateChange = (event) => {
        if (event.target.value !== '') {
            setIsEndFromDateFilled(true);
            setIsEndToDateFilled(true);
        } else {
            setIsEndFromDateFilled(false);
            setIsEndToDateFilled(false);
        }
    };

    const handleEndToDateChange = (event) => {
        if (event.target.value !== '') {
            setIsEndFromDateFilled(true);
            setIsEndToDateFilled(true);
        } else {
            setIsEndFromDateFilled(false);
            setIsEndToDateFilled(false);
        }
    };

    const currentDate = new Date();
    const endDateLimit = new Date();
    endDateLimit.setFullYear(currentDate.getFullYear() + 1);
    endDateLimit.setDate(endDateLimit.getDate() - 1);


    // const currentDate = new Date();
    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - 1);
    const maxDate = new Date();
    maxDate.setFullYear(currentDate.getFullYear());
    maxDate.setDate(maxDate.getDate() - 1);



    const handleApi = async (event) => {
        window.alert("Process Started,\nPlease check your email in a while");
        event.preventDefault();

        const resp2 = await axios({
            method: 'post',
            url: 'http://115.246.101.18:5008/test',
            params: { 'api-version': '3.0' },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': 'your-rapidapi-key',
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
            },
            data: {
                keywords: event.target.elements.keywords.value,
                emails: event.target.elements.emails.value,
                endFromDate: event.target.elements.endFromDate.value,
                endToDate: event.target.elements.endToDate.value,
            },
        });
        // console.log('AXIOS : ', resp2);
        // return resp2;
        
    };

    return (
        <section className="vh-100" style={{ backgroundColor: "#eee" }}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{ borderRadius: "25px" }}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Inevitable GeM</p>
                                        <form onSubmit={handleApi} className="mx-1 mx-md-4">
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="keywordsInput">Keywords*</label>
                                                    <input type="text" id="keywordsInput" className="form-control" name="keywords" required />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="endFromDateInput">End From Date</label>
                                                    <input type="date" id="endFromDateInput" className="form-control" name="endFromDate" min={`${currentDate.getFullYear() - 1}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`} max={`${endDateLimit.getFullYear()}-${('0' + (endDateLimit.getMonth() + 1)).slice(-2)}-${('0' + endDateLimit.getDate()).slice(-2)}`} onChange={handleEndFromDateChange} required={isEndToDateFilled}/>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="endToDateInput">End To Date</label>
                                                    <input type="date" id="endToDateInput" className="form-control" name="endToDate" min={`${currentDate.getFullYear() - 1}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`} max={`${endDateLimit.getFullYear()}-${('0' + (endDateLimit.getMonth() + 1)).slice(-2)}-${('0' + endDateLimit.getDate()).slice(-2)}`} onChange={handleEndToDateChange} required={isEndFromDateFilled} />
                                                </div>
                                            </div>
                                            {/* <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="endFromDateInput">End From Date (YYYY-MM-DD)*</label>
                                                    <input type="date" id="endFromDateInput" className="form-control" name="endFromDate" min={`${currentDate.getFullYear() - 1}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`} max={`${endDateLimit.getFullYear()}-${('0' + (endDateLimit.getMonth() + 1)).slice(-2)}-${('0' + endDateLimit.getDate()).slice(-2)}`} />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="endToDateInput">End To Date (YYYY-MM-DD)*</label>
                                                    <input type="date" id="endToDateInput" className="form-control" name="endToDate" min={`${currentDate.getFullYear() - 1}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`} max={`${endDateLimit.getFullYear()}-${('0' + (endDateLimit.getMonth() + 1)).slice(-2)}-${('0' + endDateLimit.getDate()).slice(-2)}`} />
                                                </div>
                                            </div> */}
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <label className="form-label" htmlFor="emailsInput">Emails*</label>
                                                    <input type="text" id="emailsInput" className="form-control" name="emails" required />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button type="submit" className="btn btn-primary btn-lg">Send Over EMail</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                                        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                                            className="img-fluid" alt="Sample" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login
