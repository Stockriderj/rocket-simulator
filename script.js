const launchBtn = document.querySelector("#launchBtn");
const fuelInput = document.querySelector("#fuel-input");
const srbInput = document.querySelector("#srb-input");
const stagesInput = document.querySelector("#stages-input");
const fuelSelect = document.querySelector("#fuel-select");
const payloadSelect = document.querySelector("#payload-select");
const costDisplay = document.querySelector("#cost-display");
const budgetDisplay = document.querySelector("#budget-display");
const weightDisplay = document.querySelector("#weight-display");
const launchPreparationFeedbackDisplay = document.querySelector("#launch-preparation-feedback");
   
// GAME VARIABLES
var rocketVariables = {
    fuel: 0,
    fuelType: 0,
    payload: 0,
    srbs: 0,
    stages: 0,
    weight: 0,
    thrust: 0,
    cost: 0,
    update() {
        this.fuel = fuelInput.valueAsNumber;
        this.fuelType = fuelSelect.value; // Fuel Type value = Isp of rocket
        this.srbs = srbInput.valueAsNumber;
        this.stages = stagesInput.valueAsNumber;

        switch (payloadSelect.value) {
            case "lsatellite":
                this.payload = 1000;
                break;

            case "msatellite":
                this.payload = 3000;
                break;

            case "hsatellite":
                this.payload = 5000;
                break;

            default:
                this.payload = 0;
        }

        this.weight = this.payload + this.fuel + this.srbs * 100 + (4 - this.stages) * 1000;
        this.thrust = this.fuel * (this.fuelType / 1000) + this.srbs * 500 + this.stages * 100;
         
        this.cost = this.fuel * 50 + this.fuelType * this.fuel + this.srbs * 10000 + this.stages * 5000;
    }
};

var missionsInProgress = [];

var preparationError;

var budget = 150000;

const displayUpdateFunctions = {
    weight() {
        weightDisplay.style.color = "#474747";
        setTimeout(() => {
            weightDisplay.innerHTML = `Weight: ${rocketVariables.weight}`;
    
            if (rocketVariables.weight > rocketVariables.thrust) {
                weightDisplay.style.color = "crimson";
            } else {
                weightDisplay.style.color = "whitesmoke";
            }
        }, 300);
    },
    cost() {
        costDisplay.style.color = "#005000";
        setTimeout(() => {
            costDisplay.innerHTML = `Cost: $${rocketVariables.cost}`;
            costDisplay.style.color = "whitesmoke";
        }, 300);
    },
    budget(newAmount) {
        budget = newAmount;

        budgetDisplay.style.color = "#0e800e";
        setTimeout(() => {
            budgetDisplay.innerHTML = `Budget: $${newAmount}`;
            budgetDisplay.style.color = "whitesmoke";
        }, 300);
    },
    feedback (text, color = "whitesmoke") {
        launchPreparationFeedbackDisplay.style.color = "black";
        setTimeout(() => {
            launchPreparationFeedbackDisplay.innerHTML = `> ${text}`;
            launchPreparationFeedbackDisplay.style.color = color;
        }, 500);
    }
};

var warnings = {
    warn(message) {
        displayUpdateFunctions.feedback(message, "crimson");
    },
    checkPreparationErrors() {
        if (rocketVariables.payload === 0) {
            return "no_payload";
        } else if (rocketVariables.cost > budget) {
            return "bad_cost";
        } else if (rocketVariables.fuel < rocketVariables.payload / 2) {
            return "bad_fuel";
        } else if (rocketVariables.weight > rocketVariables.thrust) {
            return "bad_thrust";
        } else if (rocketVariables.srbs === 1) {
            return "bad_srbs";
        } else if (rocketVariables.fuel === 0) {
            return "no_fuel";
        } else {
            return "none";
        }
    }
}
   
function runPreparationPreview() {
    rocketVariables.update();
    displayUpdateFunctions.cost()
    displayUpdateFunctions.weight();

    preparationError = warnings.checkPreparationErrors();

    if (preparationError === "no_payload") {
        warnings.warn("Why would you build a rocket without payload?");
    } else if (preparationError === "bad_cost") {
        warnings.warn("You don't have enough money to build this rocket.");
    } else if (preparationError === "bad_fuel") {
        warnings.warn("You don't have enough fuel for the journey.");
    } else if (preparationError === "no_fuel") {
        warnings.warn("What are your plans to get to space with no fuel, Elon Musk?");
    } else if (preparationError === "bad_thrust") {
        warnings.warn("You don't have enough thrust to lift off. Try lessening the weight or adding more boosters.");
    } else if (preparationError === "bad_srbs") {
        warnings.warn("You can't have one booster. It's impossible to even the thrust out along the rocket, so have fun faceplanting your rocket into the ground.");
    } else {
        displayUpdateFunctions.feedback("The rocket is ready to go.");
    }
}

launchBtn.addEventListener("click", () => {   
    // Game Calculations
    const preparationError = warnings.checkPreparationErrors();
    
    if (preparationError === "no_payload") {
        warnings.warn("NASA turns down your mission, calling it \"meaningless\" because there's no payload.");
    } else if (preparationError === "bad_cost") {
        warnings.warn("NASA refused to build the rocket. It's out of your budget.");
    } else if (preparationError === "bad_fuel") {
        warnings.warn("Your rocket didn't make it. It ran out of fuel along the way.");
        displayUpdateFunctions.budget(budget - rocketVariables.cost);
    } else if (preparationError === "no_fuel") {
        warnings.warn("Your rocket sits on the launchpad while furiously trying to take off, but it's got no fuel to do so. NASA halves your budget to spend it on things led by people who actually think.");
        displayUpdateFunctions.budget(budget / 2);
    } else if (preparationError === "bad_thrust") {
        warnings.warn("Your rocket struggles to take off, but it just doesn't have enough thrust to do it. The whole country laughs at your expense. Mission Control stops the rocket before it wastes even more fuel, but a quarter of it is already lost.");
        displayUpdateFunctions.budget(budget - Math.round(rocketVariables.fuel / 4));
    } else if (preparationError === "bad_srbs") {
        warnings.warn("Your rocket flipped upside down and crashed into the Earth due to its uneven thrust. It becomes the disaster of the year.");
        displayUpdateFunctions.budget(budget - rocketVariables.cost);
    } else { // No errors; everything is a go
        displayUpdateFunctions.feedback("The liftoff was a success! NASA funds your space program to keep it going.");
        displayUpdateFunctions.budget(budget + 50000 - rocketVariables.cost);

        // Income over time
        const newMissionInProgress = payloadSelect.value;
        missionsInProgress.push(newMissionInProgress);
        var newMissionLifeTrackerNum = 100;
        const newMissionIncome = rocketVariables.payload;

        setInterval(() => {
            if (newMissionLifeTrackerNum > 0) {
                newMissionLifeTrackerNum--;
                displayUpdateFunctions.budget(budget + newMissionIncome);
            } else {
                missionsInProgress.shift();
                clearInterval();
            }
        }, 600);
    }
});

fuelInput.addEventListener("input", () => {
    runPreparationPreview();
});

srbInput.addEventListener("input", () => {
    runPreparationPreview();
});

stagesInput.addEventListener("input", () => {
    runPreparationPreview();
});

payloadSelect.addEventListener("input", () => {
    runPreparationPreview();
});

fuelSelect.addEventListener("input", () => {
    runPreparationPreview();
});

runPreparationPreview();