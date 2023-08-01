async function forgotPass(e){
    try{
    e.preventDefault();
        const email = document.getElementById('email').value;
        

        if(!email) {
            return alert('PLEASE ENTER CORRECT EMAIL')
        }

        const result = await axios.post("/password/forgotpassword", {email})
        console.log("POSTED")
        console.log(result.data)
        document.getElementById('email').value = ""
        document.body.innerHTML += `<div style=color:green;">${result.data.message}<div>`
    } catch(err) {
        console.log("ERROR IN FORGOTPASS FN",err)
        document.body.innerHTML += '<div style="color:red;">${err}<div>'
    }
}