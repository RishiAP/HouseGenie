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
            bootstrapBookServiceModal.hide();
            showAlert('#window-alert','success',res.message);
            setTimeout(()=>{
                window.location.href='/';
            },200);
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
