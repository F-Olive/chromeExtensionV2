let myLeads = [{
    title: "",
    url: "",
    name: "",
    company: "",
    email: ""
   }]
const inputTitle = document.getElementById("inputTitle-el")
const inputUrl = document.getElementById("input-el")
const inputName = document.getElementById("name-el")
const inputCompany = document.getElementById("company-el")
const inputEmail = document.getElementById("email-el")
const inputBtn = document.getElementById("input-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")
const exportData = document.getElementById("exportData-btn")
const leadsFromLocalStorage = JSON.parse( localStorage.getItem("myLeads") )
const tabBtn = document.getElementById("tab-btn")
const editBtn = document.getElementById("edit-btn")
const downloadButton = document.getElementById("exportData-btn") 

let isEditing = false
let editIndex = 0
   
   //If data in local storage, copy to myLeads object and render out
if (leadsFromLocalStorage) {
   myLeads = leadsFromLocalStorage
   render(myLeads)
}
   
   //Use Chrome API to add tab to myLeads array and stringify to localStorage. Render out 
tabBtn.addEventListener("click", function(){    
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
       myLeads.push({
           url: tabs[0].url, 
           title: tabs[0].title,
           name: tabs[0].name,
           company: tabs[0].company,
           email: tabs[0].email
           })
       localStorage.setItem("myLeads", JSON.stringify(myLeads) )
       render(myLeads)
       isEditing = false
   })
})
   
   //Set isEditing Boolean to True. Allow editing of selected index and then save this back to same index
function edit(index) {
   isEditing = true
   editIndex = index
   inputTitle.value = myLeads[index].title
   inputUrl.value = myLeads[index].url
   inputName.value = myLeads[index].name
   inputCompany.value = myLeads[index].company
   inputEmail.value = myLeads[index].email
}
   
   //Remove item and then enter same item at 1 lower index (index -1)
function reorderUp(index) {
   let toMoveArray =  myLeads.splice(index, 1)
   let toMoveObject = toMoveArray[0]
   myLeads.splice(index - 1, 0, toMoveObject)
   localStorage.setItem("myLeads", JSON.stringify(myLeads) )
   render(myLeads)
}
   
   //Remove item and then enter same item at 1 higher index (index + 1)
function reorderDown(index) {
   let toMoveArray =  myLeads.splice(index, 1)
   let toMoveObject = toMoveArray[0]
   myLeads.splice(index + 1, 0, toMoveObject)
   localStorage.setItem("myLeads", JSON.stringify(myLeads) )
   render(myLeads)
}
   
   //Render function 
function render(leads) {
 let listItems = ""
  for (let i = 0; i < leads.length; i++) {
      listItems += `
          <li>
              <a target='_blank' href='${leads[i].url}'>
                  ${leads[i].title} 
              </a>
              <button class="edit-btn">🔧</button>
            </li>
      `
  }
  ulEl.innerHTML = listItems
  
let editBtns = document.querySelectorAll('.edit-btn')      // make an array for each type of button so you can add eventListeners to each one

leads.forEach((lead, i) => {                              // use a for loop to loop through each item in the leads array
    editBtns[i].addEventListener("click", function(){    // add an event listener to each item in each button array
        edit(i)                                          // pass the index to each function
    })
 })
}                                                          
  
    //Deletes all leads and clears local storage
deleteBtn.addEventListener("dblclick", function() {
   localStorage.clear()
   myLeads = []
   render(myLeads)
   isEditing = false
})

   //If editing, then allow edited URL and Title to edit same indexed data, 
   //ELSE push new data to new index in object array. Set isEditing back to False, 
   //clear input boxes, add new data to local storage, Render all data again.
inputBtn.addEventListener("click", function() {
   if (isEditing) {
       myLeads[editIndex] = {
           url: inputUrl.value,
           title: inputTitle.value,
           name: inputName.value,
           company: inputCompany.value,
           email: inputEmail.value
       }
   } else { 
       myLeads.push({
       title: inputTitle.value,
       url: inputUrl.value,
       name: inputName.value,
       company: inputCompany.value,
       email: inputEmail.value
           })
       }
   isEditing = false
   inputTitle.value = ""
   inputUrl.value = ""
   inputName.value = ""
   inputCompany.value = ""
   inputEmail.value = ""
   localStorage.setItem("myLeads", JSON.stringify(myLeads))
   render(myLeads)
})

    //Lower piece of code, takes all data from myLeads array, stores it in another rows array with a .csv format which
    //is then downloadable and opened in an excel spreadhseet, with a header and new rows of data for each header.
    //Each new row comes from a new object in the myLeads array

    // Decalre an array (rows) to store the CSV file formatting.  
    //Create a For loop to iterate through all values inside each data object of myLeads array. For each itteration, 
    //apply mapData function which which joins values in each indexed object with a "," (CSV)
    //Store these values in rows array.
function getContent(myLeads) {     
    const rows = [];            
    for (let i = 0; i < myLeads.length; i++) {     //Iterate through each row
       let value = mapData(myLeads[i])               // Apply mapData Function to each indexed object
        rows.push(value)                        //Push to rows array
    }
    const content = rows.join("\n")             //Create new rows for all the myLeads.indexes
    return content
}
    
    //join data in myLeads Array with a "," for CSV formatting.
function mapData (obj) {
    let row = Object.values(obj).join(",")     
    return row
}

function generateCSV() {
    const headers = Object.keys(myLeads[0]).join(", ")     //Store KEY values in First Object and format in CSV ",", as the Headers
    const content = getContent(myLeads)                    //Run the getContent function explained above
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + content     //Format csvContent and join headers and content with a newline
    var encodedUri = encodeURI(csvContent);                 //encodes to accept certain characters
    window.open(encodedUri);
    var link = document.createElement("a");             //create an attribute element in order to download file
    link.setAttribute("href", encodedUri);              //set attributes
    link.setAttribute("download", "my_data.csv");       //set download attribute and give file a download name
    document.body.appendChild(link);                   
}

downloadButton.addEventListener("click", generateCSV)      //Click on downloadButton to run generateCSV()