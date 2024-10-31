const categoryAddModal = new bootstrap.Modal('#categoryAddModal', {})
const serviceAddModal = new bootstrap.Modal('#serviceAddModal', {})
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