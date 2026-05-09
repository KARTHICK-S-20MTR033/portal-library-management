const container = document.getElementById('container');

const signUpButton = document.getElementById('signUp');

const signInButton = document.getElementById('signIn');


// =======================
// PANEL ANIMATION
// =======================

signUpButton.addEventListener('click', () => {

    container.classList.add("right-panel-active");

});

signInButton.addEventListener('click', () => {

    container.classList.remove("right-panel-active");

});


// =======================
// SIGN UP
// =======================

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("signup-name").value;

    const email = document.getElementById("signup-email").value;

    const password = document.getElementById("signup-password").value;

    try {

        const response = await fetch(
            "http://localhost:5000/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (data.success) {

            alert("User Registered Successfully 😎");

            signupForm.reset();

        } else {

            alert("Registration Failed ❌");
        }

    } catch (error) {

        console.error(error);

        alert("Registration Failed ❌");

    }

});


// =======================
// SIGN IN
// =======================

const signinForm = document.getElementById("signin-form");

signinForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("signin-email").value;

    const password = document.getElementById("signin-password").value;

    try {

        const response = await fetch(
            "http://localhost:5000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (data.success) {

            // =======================
            // SAVE LOGIN DATA
            // =======================

            localStorage.setItem(
                "studentEmail",
                email
            );

            localStorage.setItem(
                "studentName",
                data.name
            );

            alert("Login Successful 😎");

            window.location.href =
                "dashboard.html";

        } else {

            alert("Invalid Email or Password ❌");

        }

    } catch (error) {

        console.error(error);

        alert("Login Failed ❌");

    }

});
