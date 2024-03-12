
document.addEventListener("DOMContentLoaded", (event) => getData("all").then((response) => {
   
    var low = 6;
    var medium =9;
    var high = 10;
    var total=0;
    var detractors = 0;
    var passive = 0;
    var promoters = 0;
    var npsScore=0;
    var userList = document.getElementById("userList");
    var ratingsList = document.getElementById("ratingsList")
    ratingsList.append(document.createElement("tr"),document.createElement("tr"),document.createElement("tr"));

    for (let i = 1; i <= high; i++) {
        var rat = document.createElement("td");
            rat.innerHTML = i;
            rat.id = "tdNum"
        var num = document.createElement("th");
            num.innerHTML = 0;
            num.id = "tdNum";
            num.style = "font-size: 2rem;"
        var use = document.createElement("td");
            use.innerHTML = "Users";
            use.id = "tdNum"
            use.style = "font-weight: bold;"
        ratingsList.children.item(2).append(rat);
        ratingsList.children.item(1).append(use)
        ratingsList.children.item(0).append(num);
        
    
    }

    for (var i=0; i<response.users.length; i++ ) {
        
        var user = document.createElement("tr");
        var username = document.createElement('td');
            username.innerHTML = response.users[i].username;
        var name =document.createElement('td');
            name.innerHTML = 
            `${response.users[i].name} ${response.users[i].surname}`;
        

        var rating = document.createElement('td');
        userRating = response.users[i].rating;
        ratingsList.children.item(0).children.item(userRating-1).innerHTML++
        if(userRating != null){
                
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
    
    var pP= Math.round((total - (passive+detractors))/total * 100) 
    var pD= Math.round((total - (passive+promoters))/total *100)
    npsScore = pP-pD;
    div = document.getElementById("npsScore").innerHTML = npsScore;
    

        
}));