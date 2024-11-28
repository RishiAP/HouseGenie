window.onload=()=>{
    fetch(`/api${window.location.pathname}/service_requests`)
    .then(async response=>{
        const res=await response.json();
        innerHTML=`<table class='table table-striped table-bordered'>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Service</th>
                            <th>${window.location.pathname.includes("professional")?"Customer":"Professional"}</th>
                            <th>Booked On</th>
                            <th>Expected On</th>
                            <th>Completed On</th>
                            <th>Status</th>
                            <th>Rated</th>
                        </tr>
                    </thead>
                    <tbody>`;
        res.service_requests.forEach(sr=>{
            innerHTML+=`<tr>
                            <th><a href="service_request/${sr.id}">${sr.id}</a></th>
                            <td>${sr.service.name}</td>
                            <td><div class="d-flex flex-column align-items-center gap-1">${window.location.pathname.includes("professional")?`<a href="/customer/${sr.customer.id}">${sr.customer.name}</a>`:sr.professional?`<a href="/professional/${sr.professional.id}">${sr.professional.name}</a>`:"Not Assigned"}<div class="rating">${window.location.pathname.includes("professional")?(sr.service_review!=null && sr.service_review.customer_rating? getStars(sr.service_review.customer_rating):""):(sr.service_review!=null && sr.service_review.professional_rating? getStars(sr.service_review.professional_rating):"")}</div></div></td>
                            <td>${formatDateTime(sr.date_of_request)}</td>
                            <td>${formatDate(sr.date_of_service)}</td>
                            <td>${sr.date_of_completion?formatDateTime(sr.date_of_completion):"Pending"}</td>
                            <td>${sr.service_status}</td>
                            <td class="rating"><div class="d-flex justify-content-center">${window.location.pathname.includes("professional")?(sr.service_review!=null && sr.service_review.professional_rating? getStars(sr.service_review.professional_rating):"N/A"):(sr.service_review!=null && sr.service_review.customer_rating? getStars(sr.service_review.customer_rating):"N/A")}</div></td>
                        </tr>`;
        });
        innerHTML+=`</tbody>
                    </table>`;
        document.querySelector("#service_history .history_table_div").innerHTML=innerHTML;
        document.querySelector("#service_history").classList.remove("d-none");
    })
    .catch((err)=>{
        console.log(err);
    });
}