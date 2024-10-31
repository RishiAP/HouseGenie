function addLoader(container,message){
  if(container instanceof String)
    document.querySelector(container).innerHTML=`<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status" style="margin-left:0.6rem;">${message}</span>`;
  else if(container instanceof HTMLElement)
    container.innerHTML=`<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span role="status" style="margin-left:0.6rem;">${message}</span>`;
  else
    console.log('Invalid container');
}
function removeLoader(container,text){
  if(container instanceof String)
    document.querySelector(container).innerHTML=text;
  else if(container instanceof HTMLElement)
    container.innerHTML=text;
  else
    console.log('Invalid container');
}