package main

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"gopkg.in/ini.v1" //gopkg.in/ini.v1
	"io"
	"net/http"
	"os"
	"strconv"
	"time"
)

var Port string
var Location string

type Users struct {
	Users []User `json:"users"`
}

type User struct {
	UserID   *string `json:"userID"`
	Username *string `json:"username"`
	Name     *string `json:"name"`
	Surname  *string `json:"surname"`
	Rating   *int    `json:"rating"`
}

func openConfig() {
	inidata, err1 := ini.Load("config.ini")
	if err1 != nil {
		fmt.Printf("Fail to read file: %v", err1)
		os.Exit(1)
	}
	section := inidata.Section("http")
	Port = ":" + section.Key("port").String()

	section = inidata.Section("database.options")
	Location = section.Key("location").String()

}
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT")
	(*w).Header().Set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
}

func openData(location string) (Users, error) {

	// Open the JSON file
	jsonFile, err := os.Open(location)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return Users{}, err
	}
	defer jsonFile.Close()

	// Get file stat to check if it's empty
	fileInfo, err := jsonFile.Stat()
	if err != nil {
		fmt.Println("Error getting file info:", err)
		return Users{}, err
	}

	if fileInfo.Size() == 0 {
		fmt.Println("Error: JSON file is empty")
		return Users{}, fmt.Errorf("JSON file is empty")
	}

	byteValue, _ := io.ReadAll(jsonFile)
	var jsonData, err1 = convertData(byteValue)
	if err1 != nil {
		fmt.Println("Error:", err1)
		return Users{}, err1
	}

	users, ok := jsonData.(Users)
	if !ok {
		return Users{}, fmt.Errorf("input is not of type Users")

	}
	return users, nil
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

// Database Management Functions

func generateUserIDs(data Users) (Users, error) {

	var numEmptyID = 0
	for i, user := range data.Users {
		if user.UserID == nil {
			numEmptyID++
			generatedID := fmt.Sprintf("%s%s", randomString(8), fmt.Sprintf("%06d", i))
			data.Users[i].UserID = &generatedID

		}
	}
	if numEmptyID != 0 {
		fmt.Println(" Empty UserIDs regenerated for ", strconv.Itoa(numEmptyID), " User")
	}
	return data, nil
}
func randomString(length int) string {

	b := make([]byte, length+2)
	rand.Read(b)
	return fmt.Sprintf("%x", b)[2 : length+2]
}

func convertData(jsonData []byte) (interface{}, error) {
	var data Users
	err2 := json.Unmarshal(jsonData, &data)
	if err2 != nil {
		return nil, fmt.Errorf("input is not of type Users")
	}

	return data, nil
}

func DerefString(s *string) string {
	if s != nil {
		return *s
	}

	return ""
}


// Responses


func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got / request\n")
	io.WriteString(w, "digger was geht guck mal woanders hin!\n")
}

func getUser(w http.ResponseWriter, r *http.Request) {
	println(r.Method, " Request Received")
	enableCors(&w)
	vars := mux.Vars(r)
	userID := vars["userID"]
	users, err := openData(Location)
	if err != nil {
		fmt.Println(err)
	}

	switch r.Method {

	case "OPTIONS":

		w.WriteHeader(http.StatusOK)
		return

	case "GET":
		w.Header().Set("Content-Type", "application/json")

		switch userID {

		case "any":
			var timeDigits = float64((time.Now().UnixNano()%1e7))/1e7
			var randomUser = int(float64(len(users.Users))*timeDigits)
		
			for i, user := range users.Users {
				
				if i == randomUser{
					
					b, ok := json.Marshal(user)
					if ok != nil {
						http.Error(w, "Database Error", http.StatusInternalServerError)
					}
					w.Write(b)
					return
				}
			}

		case "all":
			b, ok := json.Marshal(users)
					if ok != nil {
						http.Error(w, "Database Error", http.StatusInternalServerError)
					}
					w.Write(b)
					return

		default:
			var matches = false
			for _, user := range users.Users {
				if DerefString(user.UserID) == userID {
					matches = true
					b, ok := json.Marshal(user)
					if ok != nil {
						http.Error(w, "Database Error", http.StatusInternalServerError)
					}
					w.Write(b)
					return
				}
			}
			if !matches {
				http.Error(w, "UserID not in Dataset", http.StatusBadRequest)
			}

		}

	case "POST":
		switch userID {
		case "any":
			d := json.NewDecoder(r.Body)
			d.DisallowUnknownFields()

			var NewData Users

			err := d.Decode(&NewData)
			if err != nil {

				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			if NewData.Users == nil {
				http.Error(w, "missing field 'users' from JSON object", http.StatusBadRequest)
				return

			}

			if d.More() {
				http.Error(w, "extraneous data after JSON object", http.StatusBadRequest)
				return
			}

			saveData(NewData, Location)

		default:
			d := json.NewDecoder(r.Body)
			d.DisallowUnknownFields()

			var NewData User
			var matches = false

			err := d.Decode(&NewData)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			if d.More() {
				http.Error(w, "extraneous data after JSON object", http.StatusBadRequest)
				return
			}

			for i, user := range users.Users {
				if user.UserID == NewData.UserID {
					users.Users[i] = NewData
					matches = true
				}
			}
			if !matches {
				http.Error(w, "UserID not in Dataset", http.StatusBadRequest)
			}
			saveData(users, Location)
		}

	default:
		fmt.Fprintf(w, "Sorry, only GET, POST and OPTIONS methods are supported.")
	}
}

func main() {

	//Load Config
	openConfig()

	//Initialize and verify Database integrity
	fmt.Println("OPENING ", Location)
	var cleanData, err2 = openData(Location)
	if err2 != nil {
		fmt.Println("Error:", err2)
		return
	}

	fmt.Println("VERIFYING DATABASE INTEGRITY")
	cleanData, err2 = generateUserIDs(cleanData)
	if err2 != nil {
		fmt.Println("Error:", err2)
		return
	}
	saveData(cleanData, Location)
	fmt.Println("INTEGRITY OK")
	fmt.Println("Listening...")

	//Start a Server and Listen
	r := mux.NewRouter()
	r.HandleFunc("/", getRoot)
	r.HandleFunc("/user/{userID}", getUser)
	

	err3 := http.ListenAndServe(Port, r)
	if errors.Is(err3, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err3 != nil {
		fmt.Printf("error starting server: %s\n", err3)
		os.Exit(1)
	}

}
