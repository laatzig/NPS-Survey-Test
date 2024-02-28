package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

var Location = "/Users/henrylaatzig/Desktop/Code/NPS/database.json"

type Users struct {
	Users []User `json:"users"`
}

type User struct {
	Username *string `json:"username"`
	Name     *string `json:"name"`
	Surname  *string `json:"surname"`
	Rating   *int    `json:"rating"`
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT")
	(*w).Header().Set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
}

func openData(location string) (data []byte) {
	jsonFile, err := os.Open(Location)
	if err != nil {
		fmt.Println(err)
		return data
	}
	fmt.Println("Successfully Opened " + Location + "/n")
	byteValue, _ := io.ReadAll(jsonFile)
	defer jsonFile.Close()
	return byteValue
}

func saveData(data interface{}, location string) (confirm bool) {
	jsonData, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	_ = os.WriteFile(location, jsonData, 0644)
	fmt.Println("Data changed @" + Location)
	return
}

func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got / request\n")
	io.WriteString(w, "digger was geht guck mal woanders hin!\n")
}

func getUser(w http.ResponseWriter, r *http.Request) {

	fmt.Printf("Got " + r.Method + " request for user\n")
	enableCors(&w)
	switch r.Method {
	case "OPTIONS":

		w.WriteHeader(http.StatusOK)
		return

	case "GET":

		w.Header().Set("Content-Type", "application/json")
		user := openData(Location)
		w.Write(user)

	case "POST":
	
		d := json.NewDecoder(r.Body)
		d.DisallowUnknownFields() // catch unwanted fields

	// anonymous struct type: handy for one-time use
	var NewData Users

	err := d.Decode(&NewData)
	if err != nil {
    	// bad JSON or unrecognized json field
    	http.Error(w, err.Error(), http.StatusBadRequest)
    return
	}

	if NewData.Users == nil {
    	http.Error(w, "missing field 'users' from JSON object", http.StatusBadRequest)
    	return
	
	}


	// optional extra check
	if d.More() {
    	http.Error(w, "extraneous data after JSON object", http.StatusBadRequest)
    return
	}

	
	saveData(NewData, Location)
		
        
	default:
		fmt.Fprintf(w, "Sorry, only GET, POST and OPTIONS methods are supported.")
	}
}

func main() {
	// Loads and Unmarshalls Database
	var data Users
	json.Unmarshal(openData(Location), &data)

	//Start a Server and Listen
	mux := http.NewServeMux()
	mux.HandleFunc("/", getRoot)
	mux.HandleFunc("/user", getUser)

	err := http.ListenAndServe(":3333", mux)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}

	// Saves changed database Data
	saveData(data, Location)

}
