document.addEventListener('DOMContentLoaded', () => {

    const adminForm = document.getElementById('admin-form');

    if (adminForm) {

        adminForm.addEventListener('submit', async (e) => {

            e.preventDefault();

            const email = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            const btn = adminForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Authenticating...';
            btn.disabled = true;

            try {

                const response = await fetch("http://localhost:5000/admin-login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json();

                console.log("ADMIN LOGIN RESPONSE:", data);

                if (data.success) {

                    alert("Admin Access Granted 🚀 Redirecting...");

                    adminForm.reset();

                    window.location.href = "admindashboard.html";

                } else {

                    alert(data.message || "Invalid Credentials ❌");
                }

            } catch (error) {

                console.error(error);
                alert("Server Error ❌");

            }

            btn.textContent = originalText;
            btn.disabled = false;

        });

    }

});