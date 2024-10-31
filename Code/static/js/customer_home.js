function bookService(event,service_id){
    addLoader(event.target,'Booking...');
    event.target.disabled=true;
    fetch(`/api/book_service`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({service_id})
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            showAlert('#window-alert','success',res.message);
        }
        else if(response.status==400){
            showAlert('#window-alert','warning',res.message);
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
    }).finally(()=>{
        event.target.disabled=false;
        removeLoader(event.target,'Book');
    });
}
function showServices(event,category){
    addLoader(event.target,'Searching...');
    event.target.disabled=true;
    fetch(`/api/services/${category}`)
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==200){
            document.getElementById('lookup-alert').innerHTML='';
            if(res.services.length==0){
                document.getElementById('lookup-heading').innerHTML=`${res.category.name} Packages`;
                document.getElementById('lookup-alert').innerHTML='<div class="alert alert-warning" role="alert">No services found. Please try again later.</div>';
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
                        <button class="btn btn-primary btn-sm" onclick="bookService(event,${res.services[i].id})">Book</button>
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

function showCategories(event){
    addLoader(event.target,'Loading...');
    event.target.disabled=true;
    document.getElementById('lookup-categories').innerHTML='';
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