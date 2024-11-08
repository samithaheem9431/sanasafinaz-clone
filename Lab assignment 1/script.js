var form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    var check = true;
    var inputtag = document.getElementsByTagName("input");
    
    for(let i=0; i<inputtag.length; i++) {
        var error = document.getElementById(inputtag[i].id + "error");
        if(inputtag[i].value === '') {
            error.style.display = 'block';
            check = false;
        } else {
            if(inputtag[i].id === 'email') {
                if(!validateEmail(inputtag[i].value)) {
                    error.style.display = 'block';
                    check = false;
                    continue;
                }
            }
            error.style.display = 'none';
        }
    }
    
    if(check) {
        alert("Form Submitted Successfully");
        form.submit();
    }
});

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}