async function handleProfileEdit(event){
    event.target.disabled=true;
    addLoader(event.target,"Processing...");
    await new Promise((resolve)=>{
        setTimeout(resolve,200);
    });
    const form=document.querySelector("form");
    service=form.querySelector("#service");
    if(service){
        service.disabled=true;
        form.querySelector("#category").disabled=true;
    }
    form.querySelector("input[type='password']").parentElement.classList.remove("d-none");
    allInputs=form.querySelectorAll("input,select,textarea");
    for(let i=0;i<allInputs.length;i++){
        allInputs[i].removeAttribute("readonly");
    }
    form.querySelector(".cancel-button").classList.remove("d-none");
    event.target.removeAttribute("onclick");
    event.target.setAttribute("type","submit");
    form.setAttribute("onsubmit","saveProfileChanges(event)");
    allInputs[0].focus();
    event.target.disabled=false;
    removeLoader(event.target,"Save Changes");
}

async function saveProfileChanges(event){
    event.preventDefault();
    const formData=new FormData(event.target);
    button=event.target.querySelector("button[type='submit']");
    button.disabled=true;
    addLoader(button,"Saving...");
    fieldset=event.target.querySelector("fieldset");
    fieldset.disabled=true;
    await new Promise((resolve)=>{
        setTimeout(resolve,500);
    });
    fetch('/api/edit_profile',{
        method:'PUT',
        body:formData
    })
    .then(async (response)=>{
        const res=await response.json();
        if(response.status==201){
            allInputs=event.target.querySelectorAll("input,select,textarea");
            service=event.target.querySelector("#service");
            if(service){
                service.disabled=false;
                event.target.querySelector("#category").disabled=false;
            }
            for(let i=0;i<allInputs.length;i++){
                allInputs[i].setAttribute("readonly",true);
            }
            formData.keys().forEach((key)=>{
                if(key!="password"){
                    event.target.querySelector(`input[name="${key}"]`)?.setAttribute('value',formData.get(key));
                    event.target.querySelector(`textarea[name="${key}"]`)?.setAttribute('value',formData.get(key));
                }
                else{
                    event.target.querySelector(`input[name="${key}"]`).setAttribute('value','');
                    event.target.querySelector(`input[name="${key}"]`).parentElement.classList.add("d-none");
                }
            });
            showAlert("#window-alert","success",res.message);
            event.target.querySelector(".cancel-button").classList.add("d-none");
            button.setAttribute("onclick","handleProfileEdit(event)");
            button.setAttribute("type","button");
            removeLoader(button,"Edit Profile");
            event.target.removeAttribute("onsubmit");
        }
        else{
            showAlert("#window-alert","warning",res.message);
            removeLoader(button,"Save Changes");
        }
    })
    .catch((error)=>{
        showAlert("#window-alert","danger",error.message);
        removeLoader(button,"Save Changes");
        console.error(error);
    }).finally(()=>{
        button.disabled=false;
        fieldset.disabled=false;
    });
}

async function cancelEditing(event) {
    event.target.disabled=true;
    addLoader(event.target,"Cancelling...");
    await new Promise((r)=>setTimeout(r,300));
    form=document.querySelector("form");
    form.reset();
    event.target.disabled=false;
    removeLoader(event.target,"Cancel");
    event.target.classList.add("d-none");
    submit_button=form.querySelector('button[type="submit"]');
    submit_button.setAttribute("onclick","handleProfileEdit(event)");
    submit_button.setAttribute("type","button");
    form.removeAttribute("onclick");
    service=form.querySelector("#service");
    if(service){
        service.disabled=false;
        form.querySelector("#category").disabled=false;
    }
    event.target.querySelector(`input[name="password"]`).setAttribute('value','');
    event.target.querySelector(`input[name="password"]`).parentElement.classList.add("d-none");
}