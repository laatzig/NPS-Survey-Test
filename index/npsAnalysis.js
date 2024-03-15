
document.addEventListener("DOMContentLoaded", (event) => getData("all").then((response) => {
   
    var low = 6;
    var medium =9;
    var high = 10;
    var total=0;
    var detractors = 0;
    var passive = 0;
    var promoters = 0;
    var npsScore=0;
    const ratingArray = []
    for (var i=0; i<high; i++){
        ratingArray[i]=0
    }
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
            num.style = "font-size: 1.2rem;"
       
        ratingsList.children.item(2).append(rat);
        // ratingsList.children.item(0).append(num);
        
    
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
        ratingArray[userRating-1]++
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


    ratingArray.forEach((value, index)=>{ 
        var tableDiv = ratingsList.children.item(0)
       // var numberDiv = tableDiv.children.item(index)
       // numberDiv.innerHTML = value;
    })

    var pP= Math.round((total - (passive+detractors))/total * 100) 
    var pD= Math.round((total - (passive+promoters))/total *100)
    npsScore = pP-pD;

    div = document.getElementById("npsScore").innerHTML = npsScore;



function createBar(value,maxHeight) {
    const barContainer = document.createElement("td");
    const barDiv = document.createElement("div");
    const barCircle = document.createElement("div")
    barDiv.classList.add("bar");
    barDiv.style.height = (100*value/maxHeight) + "%"; 
    barDiv.append(barCircle)
    barContainer.classList.add("chart")
    barContainer.append(barDiv)
    barCircle.classList.add("barCircle")
 
    return barContainer;
   
}


function createBarChart() {
    const chartContainer = document.createElement("tr");
    chartContainer.innerHTML = "";
    maxHeight = Math.max(...ratingArray)
    console.log(maxHeight)
    ratingsList.insertBefore(chartContainer,ratingsList.children.item(0))
    ratingArray.forEach((value,index) => {
        const bar = createBar(value,maxHeight);
        chartContainer.appendChild(bar)
    });
}

createBarChart();

        
}));
