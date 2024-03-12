async function getData(userID) {
switch (userID){
case "any":
    var response = await fetch("http://localhost:3333/user/any",{
        method: 'GET',
        mode: 'cors'

    });
    var data = await response.json();
    return data
    
default: 
    var response = await fetch(`http://localhost:3333/user/${userID}`,{
        method: 'GET',
        mode: 'cors'

    });
    var data = await response.json();
    return data
    
}  
}

async function saveData(data , userID) {

switch (userID){
case "any":
 await fetch("http://localhost:3333/user/any",{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
            },
        body: JSON.stringify(data)
            
});
return true
default:
    await fetch(`http://localhost:3333/user/${userID}`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
            },
        body: JSON.stringify(data)
    });
}

}