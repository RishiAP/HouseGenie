const bookServiceModal=document.getElementById('bookServiceModal');
const bootstrapBookServiceModal = bookServiceModal?new bootstrap.Modal(bookServiceModal,{}):null;
const reviewModal=document.getElementById('reviewModal');
const bootstrapReviewModal = reviewModal? new bootstrap.Modal(reviewModal,{}):null;
window.onload=()=>{
    const requests_table=document.getElementById('requests');
    if(!requests_table)
        return;
    fetch('/api/service_request')
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            const closed=res.service_requests.filter(sr=>sr.service_status=="Closed");
            const closed_by_professional=res.service_requests.filter(sr=>sr.service_status!="Closed" && sr.date_of_completion!=null);
            const accepted=res.service_requests.filter(sr=>sr.service_status=="Accepted" && sr.date_of_completion==null);
            const assigned=res.service_requests.filter(sr=>sr.service_status=="Assigned");
            const requested=res.service_requests.filter(sr=>sr.service_status=="Requested");
            closed.sort((a,b)=>new Date(b.date_of_request)-new Date(a.date_of_request));
            closed_by_professional.sort((a,b)=>new Date(b.date_of_request)-new Date(a.date_of_request));
            accepted.sort((a,b)=>new Date(a.date_of_request)-new Date(b.date_of_request));
            assigned.sort((a,b)=>new Date(a.date_of_request)-new Date(b.date_of_request));
            requested.sort((a,b)=>new Date(a.date_of_request)-new Date(b.date_of_request));
            const rejected=res.service_requests.filter(sr=>sr.service_status=="Rejected");
            rejected.sort((a,b)=>new Date(a.date_of_request)-new Date(b.date_of_request));
            res.service_requests=[...requested,...assigned,...accepted,...closed_by_professional,...rejected,...closed];
            innerHTML='';
            for(let i=0;i<res.service_requests.length;i++){
                innerHTML+=`<tr>
                <th><a href="/service_request/${res.service_requests[i].id}" target="_blank">${res.service_requests[i].id}</a></th>
                <td>${res.service_requests[i].service.name}</td>
                <td>${res.service_requests[i].service.price}</td>
                <td>${res.service_requests[i].service.time_required_minutes}</td>
                <td>${formatDateTime(res.service_requests[i].date_of_request)}</td>
                <td>${formatDate(res.service_requests[i].date_of_service)}</td>
                ${
                    res.service_requests[i].professional? `<td>${res.service_requests[i].professional.name}</td>
                    <td>${res.service_requests[i].professional.phone}</td>
                    <td>${res.service_requests[i].date_of_completion? formatDateTime(res.service_requests[i].date_of_completion) :"Pending"}</td>`
                    : `<td colspan="3">Not assigned</td>`
                }
                <td><div class="d-flex justify-content-center ms-auto rating">${
                    res.service_requests[i].service_status=="Accepted"? `<button class="btn btn-success btn-sm" onclick="closeRequest(event,${res.service_requests[i].id})">Close it</button>`: ["Requested","Assigned"].includes(res.service_requests[i].service_status)?`<button class="btn btn-primary btn-sm" onclick="opeEditModal(event,${res.service_requests[i].id})">Edit</button>`: res.service_requests[i].service_status=="Closed"? res.service_requests[i].service_review?.customer_rating?getStars(res.service_requests[i].service_review.customer_rating):`<button class="btn btn-warning btn-sm" onclick="openRateRequestModal(event,${res.service_requests[i].id},true)">Rate it</button>`:res.service_requests[i].service_status
                }</div></td>`;
            }
            requests_table.querySelector('tbody').innerHTML=innerHTML;
            if(res.service_requests.length==0){
                showAlert('#request-table-alert','info','No requests found.');
            }
            else{
                requests_table.classList.remove('d-none');
            }
        }
        else{
            console.log(res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    });
}

async function chooseDate(event,service_id){
    dismissAlert('#window-alert');
    dismissAlert('#booking-alert');
    event.target.disabled=true;
    addLoader(event.target,'Loading...');
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service/${service_id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            bookServiceModal.querySelector('.modal-title').innerHTML="Book Service";
            bookServiceModal.querySelector('.id_type').innerHTML="Service ID : ";
            bookServiceModal.querySelector('._id').innerHTML=res.service.id;
            bookServiceModal.querySelector('#book_service_name').innerHTML=res.service.name;
            bookServiceModal.querySelector('#book_service_price').innerHTML=res.service.price;
            bookServiceModal.querySelector('#book_service_time').innerHTML=res.service.time_required_minutes;
            bookServiceModal.querySelector('#book_service_desc').innerHTML=res.service.description;
            bookServiceModal.querySelector('#expected_on').min=new Date().toISOString().split('T')[0];
            bookServiceModal.querySelector('#expected_on').value="yyyy-mm-dd";
            bookServiceModal.querySelector('button[type="submit"]').innerHTML='Book Service';
            bookServiceModal.querySelector("form").setAttribute('onsubmit',`bookService(event,${res.service.id})`);
            bootstrapBookServiceModal.show();
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
    .finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Book');
    });
}

async function bookService(event,service_id){
    event.preventDefault();
    date_of_service=document.getElementById('expected_on').value;
    button=event.target.querySelector('button[type="submit"]');
    dismissAlert('#booking-alert');
    dismissAlert('#window-alert');
    addLoader(button,'Booking...');
    button.disabled=true;
    dismissAlert('#window-alert');
    await new Promise(r => setTimeout(r, 1000));
    fetch(`/api/service/${service_id}/book`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({date_of_service})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            const row=document.createElement('tr');
            row.innerHTML=`<th><a href="/service_request/${res.service_request.id}" target="_blank">${res.service_request.id}</a></th>
            <td>${res.service_request.service.name}</td>
            <td>${res.service_request.service.price}</td>
            <td>${res.service_request.service.time_required_minutes}</td>
            <td>${formatDateTime(res.service_request.date_of_request)}</td>
            <td>${formatDate(res.service_request.date_of_service)}</td>
            <td colspan="3">Not assigned</td>
            <td><div class="d-flex justify-content-center ms-auto rating">
            <button class="btn btn-primary btn-sm" onclick="opeEditModal(event,${res.service_request.id})">Edit</button>
            </div></td>`;
            bootstrapBookServiceModal.hide();
            requestTable=document.getElementById('requests').querySelector('tbody');
            requestTable.insertBefore(row,requestTable.firstChild);
            showAlert('#window-alert','success',res.message);
            document.getElementById('requests').classList.remove('d-none');
        }
        else if(response.status==400){
            showAlert('#booking-alert','warning',res.message);
        }
        else{
            showAlert('#booking-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        button.disabled=false;
        removeLoader(button,'Book Service');
    });
}

async function showServices(event,category){
    addLoader(event.target,'Searching...');
    event.target.disabled=true;
    dismissAlert('#window-alert');
    await new Promise(r => setTimeout(r, 1000));
    fetch(`/api/services/${category}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            document.getElementById('lookup-alert').innerHTML='';
            if(res.services.length==0){
                document.getElementById('lookup-heading').innerHTML=`${res.category.name} Packages`;
                document.getElementById('lookup-alert').innerHTML='<div class="alert alert-warning" role="alert">No services available right now. Please try again later.</div>';
                document.getElementById('services').classList.remove('d-none');
            }
            else{
                document.getElementById('lookup-heading').innerHTML=`Best ${res.category.name} Packages`;
                const services=document.querySelector('#services');
                const services_table=document.querySelector('#services table');
                innerHTML='';
                for(let i=0;i<res.services.length;i++){
                    innerHTML+=`<tr>
                    <td>${res.services[i].id}</td>
                    <td>${res.services[i].name}</td>
                    <td>${res.services[i].description}</td>
                    <td>${res.services[i].price}</td>
                    <td>${res.services[i].time_required_minutes}</td>
                    <td>
                    <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                        <button type="button" class="btn btn-primary btn-sm" onclick="chooseDate(event,${res.services[i].id})">Book</button>
                    </div>
                    </td>`
                }
                services_table.querySelector('tbody').innerHTML=innerHTML;
                services.classList.remove('d-none');
                services_table.classList.remove('d-none');
            }
            document.getElementById('lookup-categories').classList.add('d-none');
        }
        else{
            console.log(res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Show Packages');
    });
}

async function showCategories(event){
    addLoader(event.target,'Loading...');
    event.target.disabled=true;
    document.getElementById('lookup-categories').innerHTML='';
    await new Promise(r => setTimeout(r, 1000));
    fetch('/api/service_category')
    .then(async (response)=>{
        const res=await response.json();
        document.getElementById('lookup-alert').innerHTML='';
        if(response.status==200){
            const services=document.querySelector('#services');
                const services_table=document.querySelector('#services table');
            innerHTML='';
            for(let i=0;i<res.categories.length;i++){
                innerHTML+=`<div class="card text-center mb-3" style="width: 18rem;">
                <div class="card-body">
                  <h5 class="card-title">${res.categories[i].name}</h5>
                  <p class="card-text">${res.categories[i].description}</p>
                  <button type="button" class="btn btn-primary stretched-link" onclick="showServices(event,${res.categories[i].id})">Show Packages</button>
                </div>
              </div>`;
            }
            services.classList.add('d-none');
            services_table.classList.add('d-none');
            document.getElementById('lookup-categories').innerHTML=innerHTML;
            document.getElementById('lookup-categories').classList.remove('d-none');
            document.getElementById('lookup-heading').innerHTML='Looking for?';
        }
        else{
            document.getElementById('lookup-alert').innerHTML='<div class="alert alert-warning" role="alert">No categories found. Please try again later.</div>';
        }
    })
    .catch((err)=>{
        document.getElementById('lookup-alert').innerHTML=`<div class="alert alert-danger" role="alert">Something went wrong (${err}). Please try again later.</div>`;
        console.log(err);
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Show Categories');
    });
}

async function openRateRequestModal(event,id,rateSeperate=false){
    if(rateSeperate){
        event.target.disabled=true;
        addLoader(event.target,'Processing...');
        await new Promise(r => setTimeout(r, 500));
    }
    fetch(`/api/service_request/${id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            reviewModal.querySelector(".submit-button").setAttribute('onclick',`rateRequest(event,${id})`);
            reviewModal.querySelector('.request_id').innerHTML=res.service_request.id;
            reviewModal.querySelector('#service_name').value=res.service_request.service.name;
            reviewModal.querySelector('#service_price').value=res.service_request.service.price;
            reviewModal.querySelector('#requested_date').value=formatDateTime(res.service_request.date_of_request);
            reviewModal.querySelector('#expected_date').value=formatDate(res.service_request.date_of_service);
            reviewModal.querySelector('#completed_date').value=res.service_request.date_of_completion?formatDateTime(res.service_request.date_of_completion):"Pending";
            reviewModal.querySelector('#rating_to_id').value=res.service_request.professional.id;
            reviewModal.querySelector('#rating_to_name').value=res.service_request.professional.name;
            reviewModal.querySelector('#rating_to_phone').value=res.service_request.professional.phone;
            bootstrapReviewModal.show();
        }
        else{
            showAlert('#window-alert','warning',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    })
    .finally(()=>{
        if(rateSeperate){
            event.target.disabled=false;
            removeLoader(event.target,'Rate it');
        }
    });
}

async function closeRequest(event,id){
    addLoader(event.target,'Closing...');
    event.target.disabled=true;
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${id}/close`,{
        method: 'PUT',
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            event.target.innerHTML='Rate it';
            event.target.setAttribute('onclick',`openRateRequestModal(event,${id},true)`);
            completed_on_index=0;
            if(res.date_of_completion!="Pending"){
                theads=event.target.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll("thead th");
                for(let i=0;i<theads.length;i++){
                    if(theads[i].innerHTML=="Completed on"){
                        break;
                    }
                    completed_on_index++;
                }
                if(completed_on_index<theads.length){
                    event.target.parentElement.parentElement.parentElement.querySelectorAll("td")[completed_on_index-1].innerHTML=formatDateTime(res.date_of_completion);
                }
            }
            event.target.classList.remove('btn-primary');
            event.target.classList.add('btn-warning');
            openRateRequestModal(event,id);
        }
        else{
            showAlert('#window-alert','warning',res.message);
            removeLoader(event.target,'Close it');
        }
    })
    .catch((err)=>{
        console.log(err);
        removeLoader(event.target,'Close it');
    })
    .finally(()=>{
        event.target.disabled=false;
    });
}

async function rateRequest(event,id){
    checkedRating=document.querySelector('input[name="rating"]:checked');
    if(checkedRating==null){
        showAlert('#review-alert','warning','Please rate the service');
        return;
    }
    review=document.getElementById('review').value;
    dismissAlert('#review-alert');
    addLoader(event.target,'Rating...');
    event.target.disabled=true;
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${id}/rate`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            rating:checkedRating.value,
            review:review==""?null:review
        })
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            reviewModal.querySelector('form').reset();
            bootstrapReviewModal.hide();
            document.getElementById('requests').querySelector(`button[onclick="openRateRequestModal(event,${id},true)"]`).parentElement.innerHTML=getStars(checkedRating.value);
            showAlert('#window-alert','success',res.message);
        }
        else if(response.status==400){
            showAlert('#review-alert','warning',res.message);
        }
        else{
            showAlert('#review-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Rate');
    });
}

async function opeEditModal(event,id) {
    dismissAlert('#window-alert');
    dismissAlert('#booking-alert');
    event.target.disabled=true;
    addLoader(event.target,'Loading...');
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            bookServiceModal.querySelector('.modal-title').innerHTML="Edit Request";
            bookServiceModal.querySelector('.id_type').innerHTML="Request ID : ";
            bookServiceModal.querySelector('._id').innerHTML=res.service_request.id;
            bookServiceModal.querySelector('#book_service_name').innerHTML=res.service_request.service.name;
            bookServiceModal.querySelector('#book_service_price').innerHTML=res.service_request.service.price;
            bookServiceModal.querySelector('#book_service_time').innerHTML=res.service_request.service.time_required_minutes;
            bookServiceModal.querySelector('#book_service_desc').innerHTML=res.service_request.service.description;
            bookServiceModal.querySelector('#expected_on').value=res.service_request.date_of_service
            bookServiceModal.querySelector('#expected_on').min=new Date().toISOString().split('T')[0];
            bookServiceModal.querySelector('button[type="submit"]').innerHTML='Update';
            bookServiceModal.querySelector("form").setAttribute('onsubmit',`editRequest(event,${res.service_request.id})`);
            bootstrapBookServiceModal.show();
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
    .finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Edit');
    });
}

async function editRequest(event,id){
    event.preventDefault();
    date_of_service=document.getElementById('expected_on').value;
    button=event.target.querySelector('button[type="submit"]');
    dismissAlert('#booking-alert');
    dismissAlert('#window-alert');
    addLoader(button,'Updating...');
    button.disabled=true;
    dismissAlert('#window-alert');
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${id}/edit`,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({date_of_service})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            bootstrapBookServiceModal.hide();
            document.getElementById('requests').querySelector(`a[href="/service_request/${id}"]`).parentElement.parentElement.querySelectorAll("td")[4].innerHTML=formatDate(date_of_service);
            showAlert('#window-alert','success',res.message);
        }
        else if(response.status==400){
            showAlert('#booking-alert','warning',res.message);
        }
        else{
            showAlert('#booking-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        button.disabled=false;
        removeLoader(button,'Update');
    });
}