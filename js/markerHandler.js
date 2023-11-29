var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

     
    //Get Table Number
    if (tableNumber === null) {
      this.askTableNumber();
    }

    //Get the dishes collection
    var dishes = await this.getDishes();

    //makerFound Event
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    //markerLost Event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";

   swal({
    icon : iconUrl,
    title : "Welcome to Hunger!!",
    content : {
      element : "input",
      attributes : {
        placeholder : "Enter Table No.",
        type : "number",
        min : 1,
      },
    },
    closeOnClickOutside : false,
   }).then(userInput=>{
      tableNumber = userInput    
   })
    
    
  },

  handleMarkerFound: function (dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    // sunday - saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    //Get the dish based on ID
    var dish = dishes.filter(dish => dish.id === markerId)[0];

    //Check if the dish is available today
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      //Changing Model scale to initial scale
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

     
      //C271: HERE IS THE CODE FOR MODEL VISIBILITY
       model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${dish.id}`);
      priceplane.setAttribute("visible", true)


      //Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      if (tableNumber != null) {
        //Handling Click Events
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Work In Progress"
          });
        });

        orderButtton.addEventListener("click", () => {
          var tnumber;  
          //condition ? action : action 2
          tableNumber <=9 ? (tnumber = `T0${tableNumber}`) : (tnumber = `T${tableNumber}`)
          this.handleOrder(tnumber,dish) 
        
          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order will serve soon on your table!",
            timer: 2000,
            buttons: false
          });
        });
      }
    }
  },

  handleOrder: function (tnumber, dish) {
    // Reading current table order details
    firebase.firestore().collection("tables").doc(tnumber).get().then(snap=>{
      var details = snap.data()
      if(details["current_orders"][dish.id]){
        details["current_orders"][dish.id]["quantity"]+= 1;
        var subTotal = details["current_orders"][dish.id]["quantity"]*dish.price
        details["current_orders"][dish.id]["subtotal"] = subTotal
      }
      else{
        details["current_orders"][dish.id] = {
          item : dish.dish_name,
          price : dish.price,
          quantity : 1,
          subtotal : dish.price
        }
      }
      details.total_bill +=dish.price
      console.log("data done")
      firebase.firestore().collection("tables").doc(snap.id).update(details).then(()=>{console.log("updated")})
    })
  },


  //Function to get the dishes collection from db
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
