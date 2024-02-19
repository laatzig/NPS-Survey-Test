async function getData() {
    const response = await fetch("http://localhost:3333/user",{
        method: 'GET',
        mode: 'cors'

    });
    const data = await response.json();
    return data
    
}

async function saveData(data) {

 await fetch("http://localhost:3333/user",{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
            },
        body: JSON.stringify(data)
            
});
  
}