async function getData() {
    const response = await fetch("http://localhost:3333/user",{
        method: 'GET',
        mode: 'cors'

    });
    const data = await response.json();
    return data
    
}


document.addEventListener("DOMContentLoaded", (event) => getData().then((response) => {
    var low = 4;
    var medium = 7;
    var high = 10;
    var total=0;
    var detractors = 0;
    var passive = 0;
    var promoters = 0;
    var npsScore=0;
    var userList = document.getElementById("userList");
    
    for (var i=0; i++,i<response.users.length;) {
        var user = document.createElement("tr");
        var username = document.createElement('td');
            username.innerHTML = response.users[i].username;
        var name =document.createElement('td');
            name.innerHTML = 
            `${response.users[i].name} ${response.users[i].surname}`;
        

        var rating = document.createElement('td');
            if(response.users[i].rating != null){
                userRating = response.users[i].rating;
                rating.innerHTML = response.users[i].rating;

                if (userRating<=high && userRating>=medium) {promoters++;}
                else if (userRating<medium && userRating>=low) {passive++} 
                else if (userRating<low) {detractors++}
            }else {
                rating.innerHTML = "---"
            }
            
        user.append(username, name, rating);
        userList.append(user)
        total++;

    }
    
    var pP= (total - (passive+detractors))/total *100
    var pD= (total - (passive+promoters))/total *100
    npsScore = passive;
    document.getElementById("npsScore").innerHTML = "NPS Score: "+ npsScore;
   
}));