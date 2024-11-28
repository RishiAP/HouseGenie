async function approveProfessional(event, id) {
    addLoader(event.target, 'Approving...');
    event.target.disabled = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fetch(`/api/professional/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(async (response) => {
        const res=await response.json();
        if (response.status === 201) {
            removeLoader(event.target, 'Approved');
            event.target.classList.remove('btn-outline-success');
            event.target.classList.add('btn-success');
            showAlert("#window-alert","success",res.message);
        } else {
            showAlert("#window-alert","warning",res.message);
            removeLoader(event.target, 'Approve');
            event.target.disabled = false;
        }
    })
    .catch((error) => {
        removeLoader(event.target, 'Approve');
        event.target.disabled = false;
        console.error('Error:', error);
    });
}