const navbar =`
<nav id="nav">
        <img id="logo" src="assets/Picsart_24-12-30_12-56-52-008.jpg" alt="logo">

        <div id="nav-pages">
            <a href="#">MEDICINES</a>
            <a href="#">CONSULT DOCTORS</a>
            <a href="#">CANCER CARE</a>
            <a href="#">CARE PLAN</a>
        </div>
        <div id="nav-links">
            <a href="login.html">Login</a>
            <a href="signup.html">SignUp</a>
            <a href="products.html">Products</a>
        </div>
        <div id="cart">
            <a href="cart.html">Cart</a>
        </div>
        <div class="hamburger"> &#9776;</div>
    </nav>
`;
document.getElementById("nav").innerHTML = navbar;