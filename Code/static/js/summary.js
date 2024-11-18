const main=document.querySelector('main');
function showRatings(data,title){
    total=Object.values(data).reduce((a,b)=>a+b);
    sum=0;
    for(let i=1;i<=5;i++){
        sum+=i*(data[i]||0);
    }
    average=(sum/total).toFixed(1);
    innerHTML=`<div class="card w-100">
  <div class="card-body">
    <h2 class="card-title text-center">${title}</h2>
    <div class="d-flex flex-column gap-3 align-items-center">
    <div class="avg-rating-with-no gap-2"><div class="avg-rating-bg"><div class="avg-rating fs-3" style="--rating: ${average}" aria-label="Rating: ${average} out of 5" ></div></div>(${average})</div>
    <span class="fs-5">Total Ratings : <strong>${total}</strong></span>
    `;
    for(let i=5;i>0;i--){
        percent=(((data[i]||0)/total)*100).toFixed(1);
        innerHTML+=`<div class="d-flex gap-1 align-items-center w-100"><div class="progress w-100" role="progressbar" aria-label="Warning example" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" style="height:1.25rem">
        <div class="progress-bar text-bg-warning progress-bar-striped progress-bar-animated fs-6" style="width: ${percent}%;">${percent}%</div>
</div><span class="d-flex justify-content-between align-items-center" style="min-width:100px"><span class="d-flex rating fs-6">${getOnlyFilledStars(i)}</span><span class="small">(${data[i]||0})</span></div>`;
    }
    innerHTML+=`</div></div></div>`;
    donutChart=main.querySelector("#donut-chart");
    donutChart.innerHTML=innerHTML;
    donutChart.classList.remove("d-none");
}

const makeTransparent = (color, alpha = 0.6) => {
    // Convert HEX to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;  // Use RGBA for transparency
};

function showBarChart(data,title,colors=['#007bff','#6c757d','#ffc107','#28a745','#dc3545']){
    data={
        Requested:data.Requested||0,
        Assigned:data.Assigned||0,
        Accepted:data.Accepted||0,
        Closed:data.Closed||0,
        Rejected:data.Rejected||0
    };
    if(main.getAttribute("data-signin-as")=="professional"){
        delete data.Requested;
        colors.shift();
    }
    barChartCard=document.querySelector("#bar-chart");
    barChartCard.classList.remove("d-none");
    canvas=document.createElement('canvas');
    new Chart(canvas,{
        type:'bar',
        data:{
            labels:Object.keys(data),
            datasets: [{
                label: 'No. of Requests',
                data: Object.values(data),
                backgroundColor: colors.map(color => makeTransparent(color, 0.6)),  // Make bars slightly transparent by default
                borderColor: colors,  // Set the same color for borders
                borderWidth: 2,  // Border width
                borderRadius: 10,  // Rounded corners for the bars
                hoverBackgroundColor: colors.map(color => makeTransparent(color, 0.8)),  // Make bars more solid on hover
                hoverBorderColor: colors.map(color => color),  // Same color for hover border
                hoverBorderWidth: 2  // Hover border width
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            plugins: {
                title: {
                    display: true,
                    text: title, // Set the title from the argument or default value
                    font: {
                        size: 20  // Adjust font size for the title
                    },
                    padding: {
                        bottom: 20  // Adjust padding for title spacing
                    }
                },
                legend: {
                    position: 'top', // Position legend at the top
                },
                tooltip: {
                    bodyFont: {
                        size: 14,  // Increase tooltip body font size
                        family: 'Arial',  // Optional: Set font family
                        weight: 'bold'   // Optional: Set font weight
                    },
                    titleFont: {
                        size: 18,  // Increase tooltip title font size
                        family: 'Arial',  // Optional: Set font family
                        weight: 'bold'   // Optional: Set font weight
                    },
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + ' requests'; // Show the value in tooltip
                        }
                    }
                }
            },
            scales: {
                x: {
                    // Adjust X-axis to handle single label well
                    title: {
                        display: true,
                        text: 'Request Types'
                    },
                },
                y: {
                    beginAtZero: true // Ensure the Y axis starts at 0
                }
            }
        }
    });
    barChartCard.querySelector(".card-body").appendChild(canvas);
}

window.onload=()=>{
    fetch('/api/summary')
    .then(async (response)=>{
        const res=await response.json();
        console.log(res);
        if(response.status==200){
            if(res.ratings)
            showRatings(res.ratings,"Overall Customer Rating");
            showBarChart(res.status_summary,"Service Request Status Summary");
        }
        else{
            showAlert('#window-alert','danger',res.message);
        }
    })
}