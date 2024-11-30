const categoryAddModal = new bootstrap.Modal('#categoryAddModal', {});
const assignProfessionalModal = document.querySelector('#assignProfessionalModal');
const bootstrapAssignProfessionalModal= new bootstrap.Modal(assignProfessionalModal,{});
const serviceAddModal = new bootstrap.Modal('#serviceAddModal', {});

window.onload=()=>{
    fetch('/api/service_request')
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            let nullProfessionalRequests = res.service_requests.filter(request => request.professional === null);
            nullProfessionalRequests.sort((a, b) => new Date(a.date_of_request) - new Date(b.date_of_request));
            let validRequests = res.service_requests.filter(request => request.professional !== null);
            validRequests.sort((a, b) => new Date(b.date_of_request) - new Date(a.date_of_request));
            res.service_requests = [...nullProfessionalRequests, ...validRequests];
            const requests_table=document.getElementById('requests')
            innerHTML='';
            for(let i=0;i<res.service_requests.length;i++){
                innerHTML+=`<tr>
                    <th scope="row">${res.service_requests[i].id}</th>
                    <td>${res.service_requests[i].service.name}</td>
                    <td>${res.service_requests[i].customer.name}</td>
                    <td>${res.service_requests[i].customer.address} - ${res.service_requests[i].customer.pincode}</td>
                    <td>
                        ${
                            res.service_requests[i].professional?
                            res.service_requests[i].professional.name:
                            `<button type="button" class="btn btn-primary btn-sm" onclick="chooseProfessionals(event,${res.service_requests[i].service.id},${res.service_requests[i].id})">Assign Professional</button>`
                        }
                    </td>
                    <td>${formatDateTime(res.service_requests[i].date_of_request)}</td>
                    <td>${formatDate(res.service_requests[i].date_of_service)}</td>
                    <td>${res.service_requests[i].service_status}</td>
                    <td>
                        <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                            <a class="btn btn-success btn-sm" href="/service_request/${res.service_requests[i].id}" target="_blank">View</a>
                        </div>
                    </td>
                </tr>`;
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

function addService(event){
    event.preventDefault();
    addLoader('#add-service-button','Adding...');
    document.getElementById('add-service-button').disabled=true;
    const name=document.getElementById('new_service_name').value;
    const description=document.getElementById('new_service_description').value;
    const price=document.getElementById('new_service_price').value;
    const time=document.getElementById('new_service_time').value;
    const category=document.getElementById('new_service_category').value;
    fetch("/api/services",{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({name,description,price,time,category})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            serviceAddModal.hide();
            const service_table=document.querySelector('table#services tbody');
            service_table.innerHTML+=`<tr>
                <th scope="row">${res.service.id}</th>
                <td>${res.service.name}</td>
                <td>${res.service.description}</td>
                <td>${res.service.price}</td>
                <td>${res.service.time_required_minutes}</td>
                <td>${res.service.category.name}</td>
                <td>
                <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                    <button class="btn btn-primary btn-sm" onclick="openEditServiceModal(event,${res.service.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService(event,${res.service.id})">Delete</button>
                </div>
                </td>
            </tr>`;
            service_table.parentElement.classList.remove("d-none");
            document.querySelector("#services-alert").classList.add("d-none");
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#service-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        document.getElementById('add-service-button').disabled=false;
        removeLoader('#add-service-button','Add Service');
    });
}
function addCategory(event){
    event.preventDefault();
    addLoader('#add-category-button','Adding...');
    document.getElementById('add-category-button').disabled=true;
    const name=document.getElementById('new_category_name').value;
    const description=document.getElementById('new_category_description').value;
    fetch("/api/service_category",{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({name,description})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            categoryAddModal.hide();
            document.querySelector('table#categories tbody').innerHTML+=`<tr>
                <th scope="row">${res.category.id}</th>
                <td>${res.category.name}</td>
                <td>${res.category.description}</td>
                <td>
                <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                    <button class="btn btn-primary btn-sm" onclick="openEditCategoryModal(event,'${res.category.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(event,'${res.category.id}')">Delete</button>
                </div>
                </td>
            </tr>`;
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#category-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        document.getElementById('add-category-button').disabled=false;
        removeLoader('#add-category-button','Add Category');
    });
}

async function chooseProfessionals(event,service_id,service_request_id){
    event.target.disabled=true;
    addLoader(event.target,"Searching Professionals");
    await new Promise(r=>setTimeout(r,1000));
    fetch(`/api/service/${service_id}/professionals/approved`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            innerHTML=``;
            if(res.professionals.length==0){
                showAlert("#window-alert","info","No professionals found for the service.");
                return;
            }
            document.querySelector(".service_request_details").innerHTML=`<h2 class="fw-normal fs-4 text-center"><strong>Service Name : </strong>${res.service.name}</h2>`;
            for(let i=0;i<res.professionals.length;i++){
                innerHTML+=`<div class="professional-assign-div">
                <input type="radio" id="professional_${res.professionals[i].id}" name="assigned_professional" value="${res.professionals[i].id}" class="d-none" oninput="dismissAlert('#assign-professional-alert')" >
                <label for="professional_${res.professionals[i].id}" class="professional-label"><div class="d-flex text-body-secondary w-100 align-items-center">
      <div class="mb-0 lh-sm w-100">
        <div class="d-flex gap-3 align-items-center">
          <strong class="text-gray-dark">${res.professionals[i].name} (${res.professionals[i].email})</strong>${res.professionals[i].average_rating!=0 && `<div class="avg-rating-with-no gap-2 small"><div class="avg-rating-bg"><div class="avg-rating fs-5" style="--rating: ${res.professionals[i].average_rating}" aria-label="Rating: ${res.professionals[i].average_rating} out of 5" ></div></div>${res.professionals[i].average_rating}</div>`}
        </div>
        <span class="d-block small">
                <strong>Address : </strong>${res.professionals[i].address} - <strong><em>${res.professionals[i].pincode}</em></strong>
        </span>
        <span class="d-flex gap-3 small">
            <div>
                <strong>Assigned : </strong>${res.professionals[i].assigned}
            </div>
            <div>
                <strong>Accepted : </strong>${res.professionals[i].accepted}
            </div>
        </span>
      </div>
    </div></label></div>`;
            }
            assignProfessionalModal.querySelector('.modal-body .radios').innerHTML=innerHTML;
            assignProfessionalModal.querySelector('form').setAttribute("onsubmit",`assignProfessional(event,${service_request_id})`)
            bootstrapAssignProfessionalModal.show();
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert("#window-alert",error.message);
    })
    .finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,"Assign Professional");
    })
}

async function assignProfessional(event,service_request_id){
    event.preventDefault();
    dismissAlert("#assign-professional-alert");
    checkedRadio=event.target.querySelector("input[type='radio']:checked");
    if(checkedRadio==null){
        showAlert('#assign-professional-alert',"warning","Please select a professional.");
        return;
    }
    button=event.target.querySelector("button[type='submit']");
    addLoader(button,"Assigning");
    button.disabled=true;
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service_request/${service_request_id}/assign/${checkedRadio.value}`,{
        method:"PUT"
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            showAlert("#window-alert","success",res.message);
            requestTable=document.getElementById("requests");
            columns=requestTable.querySelectorAll("thead th");
            colNo=columns.length;
            requiredColNo=0;
            while(requiredColNo<colNo){
                if(columns[requiredColNo].innerHTML=="Professional Name")
                    break;
                requiredColNo++;
            }
            Array.from(requestTable.querySelector("tbody").querySelectorAll("tr")).find((row)=>row.querySelector("th").innerHTML==service_request_id).querySelectorAll("td")[requiredColNo-1].innerHTML=res.professional.name;
            bootstrapAssignProfessionalModal.hide();
        }
        else{
            showAlert("#assign-professional-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert("#assign-professional-alert","danger",error.message);
    })
    .finally(()=>{
        removeLoader(button,"Assign");
        button.disabled=false;
    })
}

async function openEditServiceModal(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Loading...");
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service/${id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            const serviceEditModal=document.getElementById("serviceAddModal");
            const serviceEditModalLabel=serviceEditModal.querySelector(".modal-title");
            const serviceEditModalForm=serviceEditModal.querySelector("form");
            const serviceEditModalButton=serviceEditModal.querySelector("button[type='submit']");
            serviceEditModalLabel.innerHTML="Edit Service";
            serviceEditModalButton.innerHTML="Edit Service";
            serviceEditModalForm.setAttribute("onsubmit",`editService(event,${id})`);
            serviceEditModalForm.querySelector("#new_service_name").value=res.service.name;
            serviceEditModalForm.querySelector("#new_service_description").value=res.service.description;
            serviceEditModalForm.querySelector("#new_service_price").value=res.service.price;
            serviceEditModalForm.querySelector("#new_service_time").value=res.service.time_required_minutes;
            serviceEditModalForm.querySelector("#new_service_category").value=res.service.category.id;
            serviceAddModal.show();
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert("#window-alert","danger",error.message);
    })
    .finally(()=>{
        removeLoader(event.target,"Edit");
        event.target.disabled=false;
    });
}

async function openServiceAddModal(event){
    await updateCategoryList();
    const addModal=document.getElementById("serviceAddModal");
    const form=addModal.querySelector("form");
    addModal.querySelector(".modal-title").innerHTML="Add Service";
    form.reset();
    form.querySelector("button[type='submit']").innerHTML="Add Service";
    form.setAttribute("onsubmit","addService(event)");
    serviceAddModal.show();
}

async function editService(event,id) {
    event.preventDefault();
    dismissAlert("#window-alert");
    dismissAlert("#service-alert");
    button=event.target.querySelector("button[type='submit']");
    button.disabled=true;
    addLoader(button,"Editing...");
    const name=document.getElementById('new_service_name').value;
    const description=document.getElementById('new_service_description').value;
    const price=document.getElementById('new_service_price').value;
    const time=document.getElementById('new_service_time').value;
    const category=document.getElementById('new_service_category').value;
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service/${id}`,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({name,description,price,time,category})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            Array.from(document.querySelectorAll(`table#services tbody tr th`)).find((th)=>th.innerHTML==id).parentElement.innerHTML=`
            <th scope="row">${res.service.id}</th>
            <td>${res.service.name}</td>
            <td>${res.service.description}</td>
            <td>${res.service.price}</td>
            <td>${res.service.time_required_minutes}</td>
            <td>${res.service.category.name}</td>
            <td>
            <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                <button class="btn btn-primary btn-sm" onclick="openEditServiceModal(event,${res.service.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(event,${res.service.id})">Delete</button>
            </div>
            </td>
            `;
            serviceAddModal.hide();
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#service-alert','danger',res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert('#service-alert','danger',error.message);
    })
    .finally(()=>{
        removeLoader(button,"Edit Service");
        button.disabled=false;
    });
}

async function deleteService(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Deleting...");
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service/${id}`,{
        method:'DELETE'
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            const service_row=Array.from(document.querySelectorAll(`table#services tbody tr th`)).find(th=>th.innerHTML==id).parentElement;
            service_row.remove();
            Array.from(service_row.querySelectorAll("td")).pop().innerHTML=`<div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                <button class="btn btn-success btn-sm" onclick="reactivateService(event,${id})">Reactivate</button>
                </div>`;
            inactive_table_body=document.querySelector(`table#inactive_services tbody`);
            inactive_table_body.insertBefore(service_row,inactive_table_body.firstChild);
            inactive_table_body.parentElement.classList.remove("d-none");
            document.querySelector("#inactive-services-alert").classList.add("d-none");
            activeServiceTableBody=document.querySelector(`table#services tbody`);
            if(activeServiceTableBody.querySelectorAll("tr").length==0){
                activeServiceTableBody.parentElement.classList.add("d-none");
                document.querySelector("#services-alert").classList.remove("d-none");
            }
            showAlert('#window-alert','info',res.message);
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
}

async function reactivateService(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Reactivating...");
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service/${id}/reactivate`,{
        method:'PUT'
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            const service_row=Array.from(document.querySelectorAll(`table#inactive_services tbody tr th`)).find(th=>th.innerHTML==id).parentElement;
            service_row.remove();
            Array.from(service_row.querySelectorAll("td")).pop().innerHTML=`<div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                <button class="btn btn-primary btn-sm" onclick="openEditServiceModal(event,${id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(event,${id})">Delete</button>
                </div>`;
            active_table_body=document.querySelector(`table#services tbody`);
            active_table_body.insertBefore(service_row,active_table_body.firstChild);
            active_table_body.parentElement.classList.remove("d-none");
            document.querySelector("#services-alert").classList.add("d-none");
            inactiveServiceTableBody=document.querySelector(`table#inactive_services tbody`);
            if(inactiveServiceTableBody.querySelectorAll("tr").length==0){
                inactiveServiceTableBody.parentElement.classList.add("d-none");
                document.querySelector("#inactive-services-alert").classList.remove("d-none");
            }
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert('#window-alert','danger',error.message);
    })
    .finally(()=>{
        removeLoader(event.target,"Reactivate");
        event.target.disabled=false;
    });
}

async function deleteCategory(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Deleting...");
    dismissAlert("#window-alert");
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service_category/${id}`,{
        method:'DELETE'
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            Array.from(document.querySelectorAll(`table#categories tbody tr th`)).find(th=>th.innerHTML==id).parentElement.remove();
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#window-alert','warning',res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert('#window-alert','danger',error.message);
    })
    .finally(()=>{
        removeLoader(event.target,"Delete");
        event.target.disabled=false;
    });
}

async function openEditCategoryModal(event,id){
    event.target.disabled=true;
    addLoader(event.target,"Loading...");
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/category/${id}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            const categoryEditModal=document.getElementById("categoryAddModal");
            const categoryEditModalLabel=categoryEditModal.querySelector(".modal-title");
            const categoryEditModalForm=categoryEditModal.querySelector("form");
            const categoryEditModalButton=categoryEditModal.querySelector("button[type='submit']");
            categoryEditModalLabel.innerHTML="Edit Category";
            categoryEditModalButton.innerHTML="Edit Category";
            categoryEditModalForm.setAttribute("onsubmit",`editCategory(event,${id})`);
            categoryEditModalForm.querySelector("#new_category_name").value=res.category.name;
            categoryEditModalForm.querySelector("#new_category_description").value=res.category.description;
            categoryAddModal.show();
        }
        else{
            showAlert("#window-alert","warning",res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert("#window-alert","danger",error.message);
    })
    .finally(()=>{
        removeLoader(event.target,"Edit");
        event.target.disabled=false;
    });
}

async function editCategory(event,id){
    event.preventDefault();
    dismissAlert("#window-alert");
    dismissAlert("#category-alert");
    button=event.target.querySelector("button[type='submit']");
    button.disabled=true;
    addLoader(button,"Editing...");
    const name=document.getElementById('new_category_name').value;
    const description=document.getElementById('new_category_description').value;
    await updateCategoryList();
    await new Promise((r)=>setTimeout(r,500));
    fetch(`/api/service_category/${id}`,{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({name,description})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            Array.from(document.querySelectorAll(`table#categories tbody tr th`)).find((th)=>th.innerHTML==id).parentElement.innerHTML=`
            <th scope="row">${res.category.id}</th>
            <td>${res.category.name}</td>
            <td>${res.category.description}</td>
            <td>
            <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                <button class="btn btn-primary btn-sm" onclick="openEditCategoryModal(event,'${res.category.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(event,'${res.category.id}')">Delete</button>
            </div>
            </td>
            `;
            categoryAddModal.hide();
            showAlert('#window-alert','success',res.message);
        }
        else{
            showAlert('#category-alert','warning',res.message);
        }
    })
    .catch((error)=>{
        console.log(error);
        showAlert('#category-alert','danger',error.message);
    })
    .finally(()=>{
        removeLoader(button,"Edit Category");
        button.disabled=false;
    });
}

async function showAddCategoryModal(event){
    const addModal=document.getElementById("categoryAddModal");
    const form=addModal.querySelector("form");
    addModal.querySelector(".modal-title").innerHTML="Add Category";
    form.reset();
    form.querySelector("button[type='submit']").innerHTML="Add Category";
    form.setAttribute("onsubmit","addCategory(event)");
    categoryAddModal.show();
}

async function updateCategoryList(){
    const response=await fetch("/api/service_category");
    const res=await response.json();
    if(response.status==200){
        const categorySelect=document.getElementById("new_service_category");
        innerHTML="<option selected disabled>Choose Category</option>";
        for(let i=0;i<res.categories.length;i++){
            innerHTML+=`<option value="${res.categories[i].id}">${res.categories[i].name}</option>`;
        }
        categorySelect.innerHTML=innerHTML;
    }
    else{
        console.log(res.message);
    }
}