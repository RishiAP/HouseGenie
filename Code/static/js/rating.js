function mouseoverStar(n){
    const ratingStars=document.querySelector("#ratingStars");
    const rating_radios=document.querySelector("#rating_radios");
    const checkedBox=rating_radios.querySelector('input[name="rating"]:checked');
    stars=ratingStars.querySelectorAll('.bi');
    if(checkedBox==null){
        for(let i=0;i<n;i++){
            stars[i].classList.remove('bi-star');
            stars[i].classList.add('bi-star-fill');
        }
        for(let i=n;i<5;i++){
            stars[i].classList.remove('bi-star-fill');
            stars[i].classList.add('bi-star');
        }
    }
    else{
        if(n>checkedBox.value){
            for(let i=0;i<n;i++){
            stars[i].classList.remove('bi-star');
            stars[i].classList.add('bi-star-fill');
            }
        }
    }
}

function mouseoutStar(){
    const ratingStars=document.querySelector("#ratingStars");
    const rating_radios=document.querySelector("#rating_radios");
    const checkedBox=rating_radios.querySelector('input[name="rating"]:checked');
    stars=ratingStars.querySelectorAll('.bi');
    if(checkedBox==null){
        for(let i=0;i<5;i++){
            stars[i].classList.remove('bi-star-fill');
            stars[i].classList.add('bi-star');
        }
    }
    else{
        for(let i=0;i<checkedBox.value;i++){
            stars[i].classList.remove('bi-star');
            stars[i].classList.add('bi-star-fill');
        }
        for(let i=checkedBox.value;i<5;i++){
            stars[i].classList.remove('bi-star-fill');
            stars[i].classList.add('bi-star');
        }
    }
}

function takeRating(event){
    n=event.target.value;
    const ratingStars=document.querySelector("#ratingStars");
    stars=ratingStars.querySelectorAll('.bi');
    for(let i=0;i<n;i++){
        stars[i].classList.remove('bi-star');
        stars[i].classList.add('bi-star-fill');
    }
    for(let i=n;i<5;i++){
        stars[i].classList.remove('bi-star-fill');
        stars[i].classList.add('bi-star');
    }
}