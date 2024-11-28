async function sendBanUnbanRequest(event,request_type,user_type,user_id){
    if(event.target.tagName=="I"){
        button=event.target.parentElement;
    }
    else{
        button=event.target;
    }
    button.disabled=true;
    dismissAlert("#window-alert");
    const originalInnerHTML=button.innerHTML;
    addLoader(button,`${request_type=="ban"?"Banning":"Unbanning"}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fetch(`/api/${request_type}/${user_type}/${user_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(async (response) => {
        const res=await response.json();
        if (response.status === 201) {
            showAlert("#window-alert",request_type=="ban"?"info":"success",res.message);
            button.classList.remove(`btn-${request_type=="ban"?"danger":"success"}`);
            button.classList.add(`btn-${request_type=="ban"?"success":"danger"}`);
            removeLoader(button,`${request_type=="ban"?"<i class='bi bi-person-check fs-4'></i>Unban ":"<i class='bi bi-person-slash fs-4'></i>Ban "}${user_type=="professional"?"Professional":"Customer"}`);
            button.setAttribute("onclick",`${request_type=="ban"?"unban":"ban"}User(event,"${user_type}","${user_id}")`);
        } else {
            showAlert("#window-alert","warning",res.message);
            removeLoader(button,originalInnerHTML);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        removeLoader(button,originalInnerHTML);
    })
    .finally(()=>{
        button.disabled=false;
    });
}

async function banUser(event,user_type,user_id) {
    sendBanUnbanRequest(event,"ban",user_type,user_id);
}

async function unbanUser(event,user_type,user_id) {
    sendBanUnbanRequest(event,"unban",user_type,user_id);
}