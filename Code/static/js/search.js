serviceStatusOptions = {Requested:"Requested", Assigned:"Assigned", Accepted:"Accepted", Rejected:"Rejected", Closed:"Closed"};
ratingOptions = {1:"1-2", 2:"2-3", 3:"3-4", 4:"4-5"};
searchOptions = {
    service_request: {service:{option:"Service Name",type:"text"}, service_status:{option:"Service Status",type:"select",options:serviceStatusOptions}, date_of_request:{option:"Date of Request",type:"date"}, date_of_service:{option:"Expected date",type:"date"}, pincode:{option:"Service in pincode",type:"number"}, date_of_completion:{option:"Completed on",type:"date"}},
    professional: {name:{option:"Name",type:"text"},email:{option:"Email",type:"text"}, phone:{option:"Phone No.",type:"tel"}, address:{option:"Address",type:"text"}, pincode:{option:"Pincode",type:"number"}, service:{option:"Service Name",type:"text"}, rating:{option:"Rating",type:"select",options:ratingOptions}},
    customer: {name:{option:"Name",type:"text"},email:{option:"Email",type:"text"}, phone:{option:"Phone No.",type:"tel"}, address:{option:"Address",type:"text"}, pincode:{option:"Pincode",type:"number"}, rating:{option:"Rating",type:"select",options:ratingOptions}}
}

signin_as=document.querySelector("main").getAttribute("data-signin-as");

async function handleCategoryInput(event) {
    search_query=document.getElementById("search_query");
    options=searchOptions[event.target.value];
    search_option=document.querySelector("#search_option");
    innerHTML=`<option selected disabled>Choose Option</option>`;
    Object.keys(options).forEach((key)=>{
        if (signin_as=="admin" && key=="pincode")
        return;
        innerHTML+=`<option value="${key}">${options[key].option}</option>`
    });
    search_option.innerHTML=innerHTML;
    search_option.disabled=false;
    input_field=document.createElement("input");
    input_field.setAttribute("type","text");
    input_field.setAttribute("name","search_query");
    input_field.setAttribute("class","form-control");
    input_field.setAttribute("id","search_query");
    input_field.setAttribute("required",true);
    input_field.setAttribute("placeholder","Search Query");
    input_field.disabled=true;
    search_query.replaceWith(input_field);
}

async function handleOptionInput(event){
    search_query.disabled=false;
    search_query=document.getElementById("search_query");
    search_category=document.getElementById("search_category").value;
    field_type=searchOptions[search_category][event.target.value].type;
    if(field_type=="select"){
        input_field=document.createElement("select");
        input_field.setAttribute("name","search_query");
        input_field.setAttribute("class","form-select");
        input_field.setAttribute("id","search_query");
        input_field.setAttribute("required",true);
        innerHTML=`<option selected disabled>Choose Option</option>`;
        Object.keys(searchOptions[search_category][event.target.value].options).forEach((key)=>{
            if(signin_as=="professional" && key=="Requested")
                return;
            innerHTML+=`<option value="${key}">${searchOptions[search_category][event.target.value].options[key]}</option>`
        });
        input_field.innerHTML=innerHTML;
        search_query.replaceWith(input_field);
    }
    else{
        input_field=document.createElement("input");
        input_field.setAttribute("type",field_type);
        input_field.setAttribute("name","search_query");
        input_field.setAttribute("class","form-control");
        input_field.setAttribute("id","search_query");
        input_field.setAttribute("required",true);
        if(field_type!="date")
        input_field.setAttribute("placeholder","Search Query");
        search_query.replaceWith(input_field);
    }
}

async function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const params=new URLSearchParams(formData).toString();
    const search_option=formData.get("search_option");
    button=event.target.querySelector("button[type='submit']");
    button.disabled=true;
    addLoader(button,"Searching...");
    document.querySelector("table")?.remove();
    await new Promise(r=>setTimeout(r,500));
    fetch(`/api/search?${params}`, {
        method: 'GET'
    })
    .then(async (response) => {
        const res=await response.json();
        console.log(res);
        if(response.status==200){
            search_category=formData.get("search_category");
            if(search_option=="pincode"){
                const unavailable=res.services.filter(service=>service.is_inactive);
                const available=res.services.filter(service=>!service.is_inactive);
                res.services=available.concat(unavailable);
            }
            if(search_category=="service_request"){
                if(res.services){
                    if(res.services.length==0){
                        document.getElementById("search_results_list").innerHTML=`<h3 class="text-center">No Service Found</h3>`;
                        return;
                    }
                    displayServices(res.services);
                    return;
                }
                if(res.service_requests.length==0){
                    document.getElementById("search_results_list").innerHTML=`<h3 class="text-center">No Service Requests Found</h3>`;
                    return;
                }
                hasCustomer=res.service_requests[0].hasOwnProperty("customer");
                hasProfessional=res.service_requests[0].hasOwnProperty("professional");
                innerHTML=`<div class="table-responsive">
                <table class="table table-bordered table-striped rating">
                    <thead>
                        <tr>
                            <th scope="col">Service ID</th>
                            <th scope="col">Service Name</th>
                            ${hasCustomer?"<th scope='col'>Customer</th>":""}
                            ${search_option!="date_of_request"?`<th scope="col">Date of Request</th>`:""}
                            ${search_option!="date_of_service"?`<th scope="col">Expected Date</th>`:""}
                            ${search_option!="service_status"?`<th scope="col">Service Status</th>`:""}
                            ${hasProfessional?"<th scope='col'>Professional</th>":""}
                            ${search_option!="date_of_completion"?`<th scope="col">Completed on</th>`:""}
                            ${!hasCustomer || !hasProfessional?"<th scope='col'>Status</th>":""}
                        </tr>
                    </thead>
                    <tbody>`;
                res.service_requests.forEach((service_request)=>{
                    rating_available=(!hasCustomer? service_request.service_review?.customer_rating:null) || (!hasProfessional? service_request.service_review?.professional_rating : null);
                    innerHTML+=`<tr>
                        <th><a href="/service_request/${service_request.id}" target="_blank">${service_request.id}</a></th>
                        <td>${service_request.service.name}</td>
                        ${hasCustomer?`<td><div class="d-flex flex-column align-items-center gap-1"><span>${service_request.customer.name}</span>${service_request.service_review?.customer_rating?`<span>${getStars(service_request.service_review.customer_rating)}</span>`:""}</td>`:""}
                        ${search_option!="date_of_request"?`<td>${formatDateTime(service_request.date_of_request)}</td>`:""}
                        ${search_option!="date_of_service"?`<td>${formatDate(service_request.date_of_service)}</td>`:""}
                        ${search_option!="service_status"?`<td>${service_request.service_status}</td>`:""}
                        ${hasProfessional?`${service_request.professional!=null?`<td><div class="d-flex flex-column align-items-center gap-1"><span>${service_request.professional.name}</span>${service_request.service_review?.professional_rating?`<span>${getStars(service_request.service_review.professional_rating)}</span>`:""}</td>`:"<td>Not assigned</td>"}`:""}
                        ${search_option!="date_of_completion"?`<td>${service_request.date_of_completion?formatDateTime(service_request.date_of_completion):service_request.service_status=="Rejected"?"Rejected":"Pending"}</td>`:""}
                        ${(!hasCustomer || !hasProfessional)? rating_available?`<td><div class="d-flex justify-content-center">${getStars(rating_available)}</div></td>`:"<td>Not Rated</td>":""}
                    </tr>`;
                });
                innerHTML+=`</tbody>
                </table>
                </div>`;
                document.getElementById("search_results_list").innerHTML=innerHTML;
            }
            else if(search_category=="professional"){
                if(res.professionals.length==0){
                    document.getElementById("search_results_list").innerHTML=`<h3 class="text-center">No Professionals Found</h3>`;
                    return;
                }
                innerHTML=`<div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone No.</th>
                            <th scope="col">Address</th>
                            ${search_option!="pincode"?`<th scope="col">Pincode</th>`:""}
                            <th scope="col">Service</th>
                            <th scope="col">Rating</th>
                        </tr>
                    </thead>
                    <tbody>`;
                res.professionals.forEach((professional)=>{
                    innerHTML+=`<tr>
                        <th><a href="/professional/${professional.id}" target="_blank">${professional.id}</a></th>
                        <td>${professional.name}</td>
                        <td>${professional.email}</td>
                        <td>${professional.phone}</td>
                        <td>${professional.address}</td>
                        ${search_option!="pincode"?`<td>${professional.pincode}</td>`:""}
                        <td>${professional.service.name}</td>
                        ${professional.average_rating!=null?
                            `<td class="small"><div class="avg-rating-with-no gap-2"><div class="avg-rating-bg"><div class="avg-rating" style="--rating: ${professional.average_rating}" aria-label="Rating: ${professional.average_rating} out of 5" ></div></div>(${professional.average_rating})<div></td>`:"<td>N/A</td>"
                        }
                    </tr>`;
                });
                innerHTML+=`</tbody>
                </table>
                </div>`;
                document.getElementById("search_results_list").innerHTML=innerHTML;
            }
            else{
                if(res.customers.length==0){
                    document.getElementById("search_results_list").innerHTML=`<h3 class="text-center">No Customers Found</h3>`;
                    return;
                }
                innerHTML=`<div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone No.</th>
                            <th scope="col">Address</th>
                            ${search_option!="pincode"?`<th scope="col">Pincode</th>`:""}
                            <th scope="col">Rating</th>
                        </tr>
                    </thead>
                    <tbody>`;
                res.customers.forEach((customer)=>{
                    innerHTML+=`<tr>
                        <th><a href="/customer/${customer.id}" target="_blank">${customer.id}</a></th>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.address}</td>
                        ${search_option!="pincode"?`<td>${customer.pincode}</td>`:""}
                        ${customer.average_rating!=null?
                            `<td class="small"><div class="avg-rating-with-no gap-2"><div class="avg-rating-bg"><div class="avg-rating" style="--rating: ${customer.average_rating}" aria-label="Rating: ${customer.average_rating} out of 5" ></div></div>(${customer.average_rating})</div></td>`:"<td>N/A</td>"
                        }
                    </tr>`;
                });
                innerHTML+=`</tbody>
                </table>
                </div>`;
                document.getElementById("search_results_list").innerHTML=innerHTML
            }
        }
    })
    .catch((err)=>{
        console.log(err);
    })
    .finally(()=>{
        button.disabled=false;
        removeLoader(button,"Search");
    });
}

function displayServices(services){
    innerHTML=`
    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Service Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Time Required (minutes)</th>
                    <th scope="col">Base Price (₹)</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>`;
        services.forEach((service)=>{
            innerHTML+=`<tr>
                <th>${service.id}</th>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>${service.time_required_minutes}</td>
                <td>${service.price}</td>
                <td>${service.is_inactive?"Unavailable":`<button type="button" class="btn btn-primary btn-sm" onclick="chooseDate(event,${service.id})">Book</button>`}</td>
            </tr>`;
        });
        innerHTML+=`</tbody>
        </table>
    </div>`;
    document.getElementById("search_results_list").innerHTML=innerHTML;
}