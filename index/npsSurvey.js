// 1. Randomly Select User
const seed = Math.random();
var userID ;

// 2. Set Header Name

document.addEventListener("DOMContentLoaded", (event) => getData("any").then((response) => {
    userID = response.userID;
    document.getElementById("header").innerHTML = "Hi "+ response.name +"! Willkommen zurück zu PantWhere.";
   
}));


// 3. Make Field Labels

var timer;
document.addEventListener("DOMContentLoaded", (event) => {
    const nPSFormDiv = document.getElementById( 'form' );
    createNPSDialog(nPSFormDiv);
});

function  createNPSDialog(elem){
    clearTimeout(timer);
    elem.innerHTML = "Wie wahrscheinlich (1-10) ist es, dass Sie uns weiterempfehlen werden?"
    var elemDiv = document.createElement('div');
        elemDiv.id = "rbDiv"
    var lower = document.createElement('div');
        lower.innerHTML = "Gering"
    var greater = document.createElement('div');

        greater.innerHTML = "Hoch"
    elem.append(elemDiv)
    elemDiv.append(lower)
    for (var i=1; i<=10; i++){
        createRadioElement(elemDiv,i,false);
    }
    elemDiv.append(greater)
    const radioButtons = document.querySelectorAll('input[name="rating"]');
    for(const radioButton of radioButtons){
            radioButton.addEventListener('change', rbFunction);
    }
      
}
function createRadioElement(elem, value, checked) {
    var id = "rating" + value
    var label = document.createElement('label');
        label.id = 'rb';
        label.innerHTML = value;
        label.name = 'rating'
        label.value = value;
        label.for = id;
    var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'rating';
        input.value = value;
        input.id = id;
        if (checked) {
            input.checked = 'checked';
        }
    label.append(input);
    elem.append(label);
    
}

// When Radio Button is selected:
// 1. hide radio buttons and display selected rating
// 2. Wait and then push selected Rating to Database
// 3. Hide Dialog Box after push


function rbFunction(e) {
    const nPSFormDiv = document.getElementById( 'form' );
    dialogConfirmTimer(nPSFormDiv, e.target.value);
}

function dialogConfirmTimer(elem,value) {

    var duration = 15;
    const radioButtons = document.querySelectorAll('#rb');
    for (radioButton of radioButtons) {
        radioButton.remove();
    }
    var t1 = document.createElement('div');
        t1.innerHTML= 
        "Danke für Ihre Bewertung. Teilen Sie uns gerne mit, was noch verbessert werden muss."

    var t2 = document.createElement('div');
        t2.innerHTML=
        "Du hast uns mit <b><u>" + value + "</u></b> bewertet. " 
        t2.className = 'backText'
    var b1 = document.createElement('div');
        b1.innerHTML =  "<u>Zurück und neubewerten</u>";
        b1.className = "inlineButton"
        b1.addEventListener("click", (event) => 
            createNPSDialog(elem));

    var timerAnim = document.createElement("div")
        timerAnim.className = "timer"
        timerAnim.style = `--duration: ${duration}; --size: 10 `
    
    var timerMask = document.createElement("div")
        timerMask.className = "mask"
    
    elem.innerHTML = "";
    timerAnim.append(timerMask)
    t2.append(b1,timerAnim)
    elem.append(t1,t2)

    
    timer = setTimeout(() => {
        endNPS(value)
      }, duration*1000);
      

}   

function endNPS(value) {
    getData(userID).then((response) => {
       
        response.rating = parseInt(value); 
        saveData(response);
        });
    const nPSFormDiv = document.getElementById( 'form' );
    nPSFormDiv.remove();
}



