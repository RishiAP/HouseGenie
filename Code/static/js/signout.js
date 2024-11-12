async function handleSignOut(event){
    addLoader(event.target,"Signing out...");
    event.target.disabled=true;
    event.target.classList.remove('btn-outline-danger');
    event.target.classList.add('btn-danger');
    await new Promise(r => setTimeout(r, 1000));
    fetch('/api/signout',{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
        }
    }).then(async response=>{
        const res=await response.json();
        if(response.status==200){
            event.target.classList.add('btn-success');
            event.target.classList.remove('btn-danger');
            removeLoader(event.target,"Sign in");
            window.location.href=window.location.href;
        }
        else{
            removeLoader(event.target,"Sign out");
            event.target.classList.add('btn-outline-danger');
            event.target.classList.remove('btn-danger');
            console.log(res.message);
        }
    }).catch((error)=>{
        event.target.classList.add('btn-outline-danger');
        event.target.classList.remove('btn-danger');
        removeLoader(event.target,"Sign out");
        console.error('Error:',error);
        console.log('An error occured. Please try again later.');
    }).finally(()=>{
        document.querySelector("#signout-button").disabled=false;
    });
}