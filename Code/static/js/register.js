function handleRegister(e,register_as){
    e.preventDefault();
    addLoader('#register-button','Registering...');
    const formData=new FormData(e.target);
    formData.append('register_as',register_as);
    fetch('/api/register',{
        method:'POST',
        body:formData
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            showAlert('#register-alert','success',res.message+". Redirecting to signin page...");
            setTimeout(()=>{
                window.location.href='/signin';
            },1000);
        }
        else if(response.status==400 && (res.message.includes('UNIQUE constraint failed: customers.phone') || res.message.includes('UNIQUE constraint failed: professionals.phone'))){
                showAlert('#register-alert','danger','Phone No. already exists. Please try another.');
        }
        else{
            showAlert('#register-alert','danger',res.message);
        }
    })
    .catch((err)=>{
        console.log(err);
        showAlert('#register-alert','danger','Something went wrong. Please try again later.');
    }).finally(()=>{
        document.querySelector('#register-button').disabled=false;
        removeLoader('#register-button','Register');
    });
}