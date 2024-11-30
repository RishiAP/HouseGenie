reviewModal=document.getElementById("reviewModal");
bootstrapReviewModal=reviewModal?new bootstrap.Modal(reviewModal):null;
async function closeRequest(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Closing...");
    await new Promise(r => setTimeout(r, 2000));
    fetch(`/api/service_request/${id}/close`,{
        method: 'PUT',
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            showAlert("#window-alert","success",res.message);
            event.target.classList.remove("btn-primary");
            event.target.classList.add("btn-danger");
            removeLoader(event.target,"Closed by you");
            event.target.parentElement.parentElement.parentElement.querySelectorAll("td")[5].innerHTML=formatDateTime(res.date_of_completion);
        }
        else{
            showAlert("#window-alert","warning",res.message);
            event.target.disabled=false;
            removeLoader(event.target,"Close it");
        }
    })
    .catch((error)=>{
        console.error('Error:', error);
        event.target.disabled=false;
        removeLoader(event.target,"Close it");
    });
}

window.onload=()=>{
    if(!document.querySelector("#requests"))
        return;
    fetch('/api/service_request')
    .then(async (response)=>{
        const res=await response.json();
        innerHTML="";
        if(response.status==200){
            if(!res.approved)
                return;
            const assigned=res.service_requests.filter((request)=>request.service_status=="Assigned");
            const closed=res.service_requests.filter((request)=>request.service_status=="Closed");
            const closed_by_professional=res.service_requests.filter((request)=>request.date_of_completion!=null && request.service_status=="Accepted");
            const accepted=res.service_requests.filter((request)=>request.service_status=="Accepted" && request.date_of_completion==null);
            const rejected=res.service_requests.filter((request)=>request.service_status=="Rejected");
            closed.sort((a,b)=>new Date(b.date_of_completion)-new Date(a.date_of_completion));
            closed_by_professional.sort((a,b)=>new Date(b.date_of_completion)-new Date(a.date_of_completion));
            accepted.sort((a,b)=>new Date(a.date_of_request)-new Date(b.date_of_request));
            rejected.sort((a,b)=>new Date(b.date_of_request)-new Date(a.date_of_request));
            const history=[...closed, ...closed_by_professional, ...accepted, ...rejected];
            for(let i=0;i<assigned.length;i++){
                innerHTML+=`<tr>
                <th scope="row">${assigned[i].id}</th>
                <td>${assigned[i].customer.name}</td>
                <td>${assigned[i].customer.phone}</td>
                <td>${assigned[i].customer.address} - ${assigned[i].customer.pincode}</td>
                <td>${formatDateTime(assigned[i].date_of_request)}</td>
                <td>${formatDate(assigned[i].date_of_service)}</td>
                <td>
                <div class="d-flex justify-content-evenly ms-auto gap-3 flex-wrap buttonContainer" style="max-width:240px;">
                <button class="btn btn-primary btn-sm" onclick="acceptRejectRequest(event,${assigned[i].id},'accept')">Accept</button>
                <button class="btn btn-danger btn-sm" onclick="acceptRejectRequest(event,${assigned[i].id},'reject')">Reject</button>
                </div>
                </td>
                </tr>`;
            }
            if(assigned.length==0){
                showAlert("#requests-alert","info","No requests found");
            }
            else{
                document.querySelector("#requests tbody").innerHTML=innerHTML;
                document.querySelector("#requests").classList.remove("d-none");
            }
            innerHTML=``;
            for(let i=0;i<history.length;i++){
                innerHTML+=`<tr>
                <th scope="row"><a href="/service_request/${history[i].id}" target="_blank">${history[i].id}</a></th>
                <td>${history[i].customer.name}</td>
                <td>${history[i].customer.phone}</td>
                <td>${history[i].customer.address} - ${history[i].customer.pincode}</td>
                <td>${formatDateTime(history[i].date_of_request)}</td>
                <td>${formatDate(history[i].date_of_service)}</td>
                <td>${
                    history[i].date_of_completion!=null?
                    formatDateTime(history[i].date_of_completion):history[i].service_status=="Rejected"?"Rejected":"Pending"
                }</td>
                <td><div class="d-flex justify-content-center ms-auto rating">${
                    history[i].service_review?.customer_rating?
                    getStars(history[i].service_review.customer_rating):"NA"
                }
                </div></td>
                <td><div class="d-flex justify-content-center ms-auto rating">${
                    history[i].service_status=="Accepted"? history[i].date_of_completion==null?
                        `<button class="btn btn-primary btn-sm" onclick="closeRequest(event,${history[i].id})">Close it</button>`:
                        `<button class="btn btn-danger btn-sm" disabled>Closed by you</button>`:history[i].service_status=="Closed"?history[i].service_review?.professional_rating?getStars(history[i].service_review?.professional_rating):`<button class="btn btn-warning btn-sm" onclick="openRateRequestModal(event,${history[i].id})">Rate it</button>`:"Rejected"
                } </div></td>
                </tr>`;
            }
            if(history.length>0){
                document.querySelector("#history tbody").innerHTML=innerHTML;
                document.querySelector("#history").classList.remove("d-none");
            }
            else{
                showAlert("#history-alert","info","No history found");
            }
        }
    })
    .catch((error)=>{
        console.error('Error:', error);
    }).finally(()=>{
        document.querySelector(".all-glow-spinners")?.classList.add("d-none");
    });
}

async function acceptRejectRequest(event,service_request_id,requestType){
    addLoader(event.target,requestType=="accept"?"Accepting":"Rejecting");
    event.target.disabled=true;
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service_request/${service_request_id}/${requestType}`,{
        method: 'PUT',
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            showAlert("#window-alert","success",res.message);
            row=event.target.parentElement.parentElement.parentElement;
            row.querySelector("th").innerHTML=`<a href="/service_request/${service_request_id}" target="_blank">${service_request_id}</a>`;
            event.target.parentElement.parentElement.parentElement.remove();
            buttonDiv=row.querySelector(".buttonContainer");
            if(requestType=="accept"){
                buttonDiv.innerHTML=`<button type="button" class="btn btn-primary btn-sm" onclick="closeRequest(event,${service_request_id},'reject')">Close it</button>`;
                row.insertCell(6).innerHTML="Pending";
                row.insertCell(7).innerHTML=`<div class="d-flex justify-content-center">NA</div>`;
            }
            else{
                buttonDiv.innerHTML="Rejected";
                row.insertCell(6).innerHTML="Rejected";
                row.insertCell(7).innerHTML=`<div class="d-flex justify-content-center">NA</div>`;
            }
            historyTable=document.querySelector("#history");
            historyTableBody=historyTable.querySelector("tbody");
            historyTableBody.insertBefore(row,historyTableBody.firstChild);
            historyTable.classList.remove("d-none");
            dismissAlert("#history-alert");
            assignedTable=document.querySelector("#requests");
            if(assignedTable.querySelector("tbody").childElementCount==0){
                assignedTable.classList.add("d-none");
                showAlert("#requests-alert","info","No requests found");
            }
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.error('Error:', error);
    });
}

async function openRateRequestModal(event,service_request_id){
    event.target.disabled=true;
    addLoader(event.target,"Loading...");
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${service_request_id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            reviewModal.querySelector(".request_id").innerText=res.service_request.id;
            reviewModal.querySelector("#requested_date").value=formatDateTime(res.service_request.date_of_request);
            reviewModal.querySelector("#expected_date").value=formatDate(res.service_request.date_of_service);
            reviewModal.querySelector("#completed_date").value=formatDateTime(res.service_request.date_of_completion);
            rating_to_name=reviewModal.querySelector("#rating_to_name");
            rating_to_id=reviewModal.querySelector("#rating_to_id");
            rating_to_phone=reviewModal.querySelector("#rating_to_phone");
            rating_to_name.value=res.service_request.customer.name;
            rating_to_phone.value=res.service_request.customer.phone;
            rating_to_id.value=res.service_request.customer.id;
            rating_to_id.parentElement.querySelector("label").innerHTML="Customer ID";
            rating_to_name.parentElement.querySelector("label").innerHTML="Customer Name";
            rating_to_phone.parentElement.querySelector("label").innerHTML="Customer Phone";
            reviewModal.querySelector(".submit-button").setAttribute('onclick',`rateRequest(event,${service_request_id})`);
            bootstrapReviewModal.show();
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.error('Error:', error);
        event.target.disabled=false;
        removeLoader(event.target,"Rate it");
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,"Rate it");
    });
}

async function rateRequest(event,service_request_id){
    event.target.disabled=true;
    addLoader(event.target,"Submitting...");
    rating=document.querySelector("#rating_radios").querySelector('input[name="rating"]:checked');
    if(rating==null){
        showAlert("#review-alert","warning","Please rate the service");
        event.target.disabled=false;
        removeLoader(event.target,"Rate it");
        return;
    }
    rating=rating.value;
    review=document.getElementById("review").value;
    await new Promise(r => setTimeout(r, 500));
    fetch(`/api/service_request/${service_request_id}/rate`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({rating,review})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            bootstrapReviewModal.hide();
            showAlert("#window-alert","success",res.message);
            rate_button=document.querySelector(`#history tbody tr td button[onclick="openRateRequestModal(event,${service_request_id})"]`);
            rate_button.parentElement.innerHTML=getStars(rating);
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.error('Error:', error);
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,"Rate it");
    });
}