function formatDateTime(utcDateString) {
    const localDatetime = new Date(utcDateString);

    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    };
    const formattedDate = localDatetime.toLocaleString('en-GB', options);
    return formattedDate.replace(", ", " at ");
}

function formatDate(utcDateString) {
    const date = new Date(utcDateString);

    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    return formattedDate;
}

function getStars(rating){
    rating=parseInt(rating);
    stars='';
    for(let i=0;i<rating;i++){
        stars+='<i class="bi bi-star-fill"></i>';
    }
    for(let i=rating;i<5;i++){
        stars+='<i class="far bi bi-star"></i>';
    }
    return stars;
}

function getOnlyFilledStars(rating){
    rating=parseInt(rating);
    stars='';
    for(let i=0;i<rating;i++){
        stars+='<i class="bi bi-star-fill"></i>';
    }
    return stars;
}