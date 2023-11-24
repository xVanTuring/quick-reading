const userNameInput = document.querySelector("#username") as HTMLInputElement;

const passwordInput = document.querySelector("#password") as HTMLInputElement;

document.querySelector("#login").addEventListener("click", () => {
    localStorage.removeItem("token")
    fetch(`/api/login`,
        {
            body: JSON.stringify({ username: userNameInput.value, password: passwordInput.value }),
            headers: { "content-type": "application/json" },
            method: "POST"
        }).then((response) => response.json())
        .then(({ token }) => {
            console.log(token)
            localStorage.setItem("token", token)
            window.location.replace("/index.html")

        })
        .catch((error) => {
            console.error(error)
        })
})

document.querySelector("#signup").addEventListener("click", () => {
    localStorage.removeItem("token")
    fetch(`/api/signup`,
        {
            body: JSON.stringify({ username: userNameInput.value, password: passwordInput.value }),
            headers: { "content-type": "application/json" },
            method: "POST"
        }).then((response) => response.json())
        .then(({ token }) => {
            console.log(token)
            localStorage.setItem("token", token)
            window.location.replace("/index.html")

        })
        .catch((error) => {
            console.error(error)
        })
})