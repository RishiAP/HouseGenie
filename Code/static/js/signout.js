function handleSignOut(){
    addLoader("#signout-button","Signing out...");
    document.querySelector("#signout-button").disabled=true;
    fetch('/api/signout',{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
        }
    }).then(async response=>{
        const res=await response.json();
        if(response.status==200){
            setTimeout(() => {
                document.querySelector("#signout-button").classList.remove('btn-outline-danger');
                document.querySelector("#signout-button").classList.add('btn-success');
                removeLoader("#signout-button","Sign in");
                window.location.href=window.location.href;
            }, 1000);
        }
        else{
            removeLoader("#signout-button","Sign out");
            console.log(res.message);
        }
    }).catch((error)=>{
        removeLoader("#signout-button","Sign out");
        console.error('Error:',error);
        console.log('An error occured. Please try again later.');
    }).finally(()=>{
        document.querySelector("#signout-button").disabled=false;
    });
}