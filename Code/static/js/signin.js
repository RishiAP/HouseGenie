function handleSignin(event){
    event.preventDefault();
    dismissAlert('#signin-alert');
    addLoader("#signin-button","Signing in...");
    document.querySelector("#signin-button").disabled=true;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const signin_as=document.getElementById('signin_as').value;
    fetch('/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password,signin_as }),
    }).then(async response =>{
        const res=await response.json();
        if(response.status==200){
            showAlert('#signin-alert','success',res.message+". Redirecting to dashboard...");
            setTimeout(()=>{
                window.location.href='/';
            },1000);
        }
        else{
            showAlert('#signin-alert','danger',res.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        showAlert('#signin-alert','danger','An error occured. Please try again later.');
    }).finally(()=>{
        removeLoader("#signin-button","Sign in");
        document.querySelector("#signin-button").disabled=false;
    });
}