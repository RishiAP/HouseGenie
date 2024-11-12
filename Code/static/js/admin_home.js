const categoryAddModal = new bootstrap.Modal('#categoryAddModal', {});
const assignProfessionalModal = document.querySelector('#assignProfessionalModal');
const bootstrapAssignProfessionalModal= new bootstrap.Modal(assignProfessionalModal,{});
const serviceAddModal = new bootstrap.Modal('#serviceAddModal', {});

window.onload=()=>{
    fetch('/api/service_request')
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
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
            document.querySelector('table#services tbody').innerHTML+=`<tr>
                <th scope="row">${res.service.id}</th>
                <td>${res.service.name}</td>
                <td>${res.service.description}</td>
                <td>${res.service.price}</td>
                <td>${res.service.time_required_minutes}</td>
                <td>${res.service.category.name}</td>
                <td>
                <div class="d-flex justify-content-evenly gap-3 flex-wrap ms-auto" style="max-width:240px">
                    <button class="btn btn-primary btn-sm" onclick="editService('${res.service.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService('${res.service.id}')">Delete</button>
                </div>
                </td>
            </tr>`;
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
                    <button class="btn btn-primary btn-sm" onclick="editCategory('${res.category.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${res.category.id}')">Delete</button>
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
            for(let i=0;i<res.professionals.length;i++){
                innerHTML+=`<div class="professional-assign-div">
                <input type="radio" id="professional_${res.professionals[i].id}" name="assigned_professional" value="${res.professionals[i].id}" class="d-none" oninput="dismissAlert('#assign-professional-alert')" >
                <label for="professional_${res.professionals[i].id}" class="professional-label"><div class="d-flex text-body-secondary pt-3 w-100">
      <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
      <div class="pb-3 mb-0 lh-sm w-100">
        <div class="d-flex justify-content-between">
          <strong class="text-gray-dark">${res.professionals[i].name} (${res.professionals[i].email})</strong>
        </div>
        <span class="d-block small">
                <strong>Address : </strong>${res.professionals[i].address} - <strong><em>${res.professionals[i].pincode}</em></strong>
        </span>
      </div>
    </div></label></div>`;
            }
            assignProfessionalModal.querySelector('.modal-body .radios').innerHTML=innerHTML;
            assignProfessionalModal.querySelector('form').setAttribute("onsubmit",`assignProfessional(event,${service_request_id})`)
            bootstrapAssignProfessionalModal.show();
        }
        else{
            showAlert("#window-alert",res.message);
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