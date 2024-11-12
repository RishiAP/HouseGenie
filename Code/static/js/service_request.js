window.onload=()=>{
    fetch(`/api${window.location.pathname}`)
    .then(async (response)=>{
        const res=await response.json();
        if(res.service_request==null){
            document.getElementById("request_error").innerText=res.message;
            document.getElementById("request_error").classList.remove("d-none");
            return;
        }
        const request=res.service_request;
        document.getElementById("request_id").innerText=request.id;
        document.getElementById("service_category").innerText=request.service.category.name;
        document.getElementById("service_name").innerText=request.service.name;
        document.getElementById("service_desc").innerText=request.service.description;
        document.getElementById("service_price").innerText="₹ "+request.service.price;
        document.getElementById("service_time").innerText=request.service.time_required_minutes+" min";
        document.getElementById("service_status").innerText=request.service_status=="Closed"?"Closed":request.date_of_completion!=null?"Completed by professional":request.service_status;
        if(request.customer){
            customer_name=document.getElementById("customer_name");
            customer_name.innerHTML=`<strong>${request.customer.name}</strong> (${request.customer.phone})<br>${request.customer.address} - <em>${request.customer.pincode}</em>`;
            customer_name.classList.remove("d-none");
        }
        customer=document.getElementById("customer");
        if(request.service_review?.customer_rating){
            customer.querySelector(".rating").innerHTML=getStars(request.service_review.customer_rating);
            customer.querySelector(".review").innerText=request.service_review.customer_review?request.service_review.customer_review:"";
        }
        requested_date=document.getElementById("requested_date");
        expected_date=document.getElementById("expected_date");
        requested_date.innerText=formatDateTime(request.date_of_request);
        expected_date.innerText=formatDate(request.date_of_service);
        customer.classList.remove("d-none");
        if(request.professional){
            professional_name=document.getElementById("professional_name");
            professional_name.innerHTML=`<strong>${request.professional.name}</strong> (${request.professional.phone})<br>${request.professional.address} - <em>${request.professional.pincode}</em>`;
            professional_name.classList.remove("d-none");
        }
        completed_on=document.getElementById("completed_on");
        completed_on.innerText=request.date_of_completion!=null?formatDateTime(request.date_of_completion):"Pending";
        professional=document.getElementById("professional");
        if(request.service_review?.professional_rating){
            professional.querySelector(".rating").innerHTML=getStars(request.service_review.professional_rating);
            professional.querySelector(".review").innerText=request.service_review.professional_review?request.service_review.professional_review:"";
        }
        professional.classList.remove("d-none");
        document.getElementById("request_info").classList.remove("d-none");
    }).catch((error)=>{
        console.error(error);
    });
}